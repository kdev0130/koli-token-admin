const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const { PrismaClient } = require('@prisma/client');
const { Connection, Keypair, Transaction, PublicKey } = require('@solana/web3.js');
const {
  getAssociatedTokenAddress,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} = require('@solana/spl-token');

admin.initializeApp();

const db = admin.firestore();
const prisma = new PrismaClient();

const TOKEN_DECIMALS = 1_000_000_000;
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const MINT_PUBLIC_KEY = process.env.MINT_PUBLIC_KEY || '';
const TREASURY_PUBLIC_KEY = process.env.TREASURY_PUBLIC_KEY || '';

const connection = new Connection(SOLANA_RPC, 'confirmed');

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function decryptPrivateKey(encryptedKey) {
  const encryptionKey = getEnv('ENCRYPTION_KEY');
  const [ivHex, encryptedHex] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return new Uint8Array(decrypted);
}

function getKashKeypair(encryptedPrivateKey) {
  const secretKey = decryptPrivateKey(encryptedPrivateKey);
  return Keypair.fromSecretKey(secretKey);
}

function getTreasuryKeypair() {
  const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;
  if (!treasuryPrivateKey) return null;

  try {
    const decoded = Buffer.from(treasuryPrivateKey, 'base64').toString();
    const keyArray = JSON.parse(decoded);
    return Keypair.fromSecretKey(Uint8Array.from(keyArray));
  } catch {
    return null;
  }
}

async function transferTokensWithKeypair(fromKeypair, toPublicKey, amount, feePayerKeypair) {
  try {
    if (!MINT_PUBLIC_KEY || !toPublicKey) {
      return { success: false, error: 'Token not configured' };
    }

    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const fromWallet = fromKeypair.publicKey;
    const toWallet = new PublicKey(toPublicKey);
    const payer = feePayerKeypair || fromKeypair;

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      fromWallet
    );

    if (fromTokenAccount.amount < BigInt(amount)) {
      return { success: false, error: 'Insufficient balance' };
    }

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      toWallet
    );

    const transaction = new Transaction();
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;
    transaction.add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet,
        amount
      )
    );

    const signers = payer.publicKey.equals(fromKeypair.publicKey)
      ? [fromKeypair]
      : [fromKeypair, payer];

    const txHash = await connection.sendTransaction(transaction, signers);
    await connection.confirmTransaction(txHash);

    return { success: true, txHash };
  } catch (error) {
    return { success: false, error: error?.message || 'Transfer failed' };
  }
}

async function getTokenBalance(walletPublicKey) {
  try {
    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const wallet = new PublicKey(walletPublicKey);
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount);
  } catch {
    return 0;
  }
}

exports.handleOdhexFiatApproval = onDocumentUpdated(
  'odhexWithdrawals/{withdrawalId}',
  async (event) => {
    const before = event.data?.before?.data() || {};
    const after = event.data?.after?.data() || {};
    const beforeStatus = String(before.status || '').toUpperCase();
    const afterStatus = String(after.status || '').toUpperCase();

    if (beforeStatus === afterStatus || afterStatus !== 'APPROVED') {
      return null;
    }

    const requestId = event.params.withdrawalId;
    if (!requestId) {
      return null;
    }

    const cashoutRef = db.collection('kashCashouts').doc(requestId);
    const cashoutSnap = await cashoutRef.get();
    if (!cashoutSnap.exists) {
      logger.warn('kashCashouts doc not found', { requestId });
      return null;
    }

    const cashout = cashoutSnap.data() || {};
    const cashoutStatus = String(cashout.status || '').toUpperCase();
    if (cashoutStatus === 'APPROVED') {
      return null;
    }

    const firebaseUid = String(cashout.firebaseUid || '');
    const amount = Number(cashout.amount || 0);
    if (!firebaseUid || !Number.isFinite(amount) || amount <= 0) {
      logger.error('Invalid cashout data', { requestId, firebaseUid, amount });
      return null;
    }

    const account = await prisma.kashAccount.findUnique({
      where: { firebaseUid },
    });

    if (!account || !account.encryptedPrivateKey) {
      logger.error('Kash account not found', { requestId, firebaseUid });
      return null;
    }

    const treasuryPublicKey = TREASURY_PUBLIC_KEY || getEnv('TREASURY_PUBLIC_KEY');
    const feePayer = getTreasuryKeypair();
    if (!treasuryPublicKey || !feePayer) {
      logger.error('Treasury not configured', { requestId });
      return null;
    }

    const rawAmount = Math.round(amount * TOKEN_DECIMALS);
    if (!Number.isSafeInteger(rawAmount) || rawAmount <= 0) {
      logger.error('Invalid transfer amount', { requestId, amount, rawAmount });
      return null;
    }

    const fromKeypair = getKashKeypair(account.encryptedPrivateKey);
    const transferResult = await transferTokensWithKeypair(
      fromKeypair,
      treasuryPublicKey,
      rawAmount,
      feePayer
    );

    if (!transferResult.success) {
      logger.error('Treasury transfer failed', {
        requestId,
        error: transferResult.error,
      });
      throw new Error(transferResult.error || 'Treasury transfer failed');
    }

    const rawBalance = await getTokenBalance(account.walletPublicKey);
    const now = new Date().toISOString();

    await prisma.kashAccount.update({
      where: { id: account.id },
      data: {
        balanceSnapshot: BigInt(rawBalance),
        lastLoginAt: new Date(),
      },
    });

    await prisma.kashTransaction.create({
      data: {
        kashAccountId: account.id,
        txHash: transferResult.txHash || null,
        reference: requestId,
        direction: 'DEBIT',
        type: 'KASH_CASHOUT',
        sourceApp: 'K_KASH',
        amount: BigInt(rawAmount),
        balanceAfter: BigInt(rawBalance),
        status: 'COMPLETED',
        metadata: {
          cashoutRequestId: requestId,
          channelId: cashout.channelId || null,
          channelLabel: cashout.channelLabel || null,
          channelType: cashout.channelType || null,
        },
      },
    });

    const txRef = db.collection('kashTransactions').doc();
    await txRef.set({
      id: txRef.id,
      kashAccountId: account.id,
      firebaseUid: account.firebaseUid,
      email: account.email,
      displayName: account.displayName || null,
      walletPublicKey: account.walletPublicKey,
      direction: 'DEBIT',
      type: 'KASH_CASHOUT',
      sourceApp: 'K_KASH',
      amount,
      balanceAfter: rawBalance ? Number(rawBalance) / TOKEN_DECIMALS : null,
      txHash: transferResult.txHash || null,
      reference: requestId,
      status: 'COMPLETED',
      metadata: {
        cashoutRequestId: requestId,
        channelId: cashout.channelId || null,
        channelLabel: cashout.channelLabel || null,
        channelType: cashout.channelType || null,
        stage: 'fiat_exchange_completed',
      },
      createdAt: now,
    });

    await cashoutRef.set(
      {
        status: 'APPROVED',
        txHash: transferResult.txHash || null,
        fiatApprovedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    await event.data.after.ref.set(
      {
        transactionHash: transferResult.txHash || null,
        processedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return null;
  }
);
