const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineString } = require('firebase-functions/params');
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
const DATABASE_URL_PARAM = defineString('DATABASE_URL');
const ENCRYPTION_KEY_PARAM = defineString('ENCRYPTION_KEY');
const SOLANA_RPC_URL_PARAM = defineString('SOLANA_RPC_URL');
const MINT_PUBLIC_KEY_PARAM = defineString('MINT_PUBLIC_KEY');
const TREASURY_PUBLIC_KEY_PARAM = defineString('TREASURY_PUBLIC_KEY');
const TREASURY_PRIVATE_KEY_PARAM = defineString('TREASURY_PRIVATE_KEY');
let prisma;
let connection;

function getParamValue(param) {
  try {
    return param.value();
  } catch {
    return undefined;
  }
}

function getPrisma() {
  if (!process.env.DATABASE_URL) {
    const value = getParamValue(DATABASE_URL_PARAM);
    if (value) {
      process.env.DATABASE_URL = value;
    }
  }

  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is missing for token-admin functions');
    throw new Error('DATABASE_URL is missing');
  }

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

const TOKEN_DECIMALS = 1_000_000_000;

function getEnv(name) {
  const value = process.env[name];
  if (value) {
    return value;
  }

  const fallback = {
    ENCRYPTION_KEY: getParamValue(ENCRYPTION_KEY_PARAM),
    SOLANA_RPC_URL: getParamValue(SOLANA_RPC_URL_PARAM),
    MINT_PUBLIC_KEY: getParamValue(MINT_PUBLIC_KEY_PARAM),
    TREASURY_PUBLIC_KEY: getParamValue(TREASURY_PUBLIC_KEY_PARAM),
    TREASURY_PRIVATE_KEY: getParamValue(TREASURY_PRIVATE_KEY_PARAM),
  }[name];

  if (fallback) {
    process.env[name] = fallback;
    return fallback;
  }

  throw new Error(`Missing ${name}`);
}

function getConnection() {
  if (!connection) {
    const rpcUrl = getEnv('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

function getMintPublicKey() {
  return getEnv('MINT_PUBLIC_KEY');
}

function getTreasuryPublicKey() {
  return getEnv('TREASURY_PUBLIC_KEY');
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
  const treasuryPrivateKey = getEnv('TREASURY_PRIVATE_KEY');
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
    if (!getMintPublicKey() || !toPublicKey) {
      return { success: false, error: 'Token not configured' };
    }

    const mint = new PublicKey(getMintPublicKey());
    const fromWallet = fromKeypair.publicKey;
    const toWallet = new PublicKey(toPublicKey);
    const payer = feePayerKeypair || fromKeypair;

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      getConnection(),
      payer,
      mint,
      fromWallet
    );

    if (fromTokenAccount.amount < BigInt(amount)) {
      return { success: false, error: 'Insufficient balance' };
    }

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      getConnection(),
      payer,
      mint,
      toWallet
    );

    const transaction = new Transaction();
    transaction.recentBlockhash = (await getConnection().getLatestBlockhash()).blockhash;
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

    const txHash = await getConnection().sendTransaction(transaction, signers);
    await getConnection().confirmTransaction(txHash);

    return { success: true, txHash };
  } catch (error) {
    return { success: false, error: error?.message || 'Transfer failed' };
  }
}

async function getTokenBalance(walletPublicKey) {
  try {
    const mint = new PublicKey(getMintPublicKey());
    const wallet = new PublicKey(walletPublicKey);
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet);
    const account = await getAccount(getConnection(), tokenAccount);
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

    logger.info('odhex status update', {
      withdrawalId: event.params.withdrawalId || null,
      beforeStatus,
      afterStatus,
    });

    if (beforeStatus === afterStatus || afterStatus !== 'APPROVED') {
      return null;
    }

    const withdrawalId = event.params.withdrawalId;
    if (!withdrawalId) {
      return null;
    }

    const requestId = String(after.cashoutRequestId || withdrawalId);

    const cashoutRef = db.collection('kashCashouts').doc(requestId);
    const cashoutSnap = await cashoutRef.get();
    if (!cashoutSnap.exists) {
      logger.warn('kashCashouts doc not found', { requestId, withdrawalId });
      return null;
    }

    const cashout = cashoutSnap.data() || {};
    const cashoutStatus = String(cashout.status || '').toUpperCase();
    const cashoutTxHash = cashout.txHash || null;
    const odhexTxHash = after.transactionHash || null;
    if (cashoutStatus === 'APPROVED' && cashoutTxHash && odhexTxHash) {
      logger.info('Cashout already finalized', { requestId });
      return null;
    }

    const firebaseUid = String(cashout.firebaseUid || '');
    const amount = Number(cashout.amount || 0);
    if (!firebaseUid || !Number.isFinite(amount) || amount <= 0) {
      logger.error('Invalid cashout data', { requestId, firebaseUid, amount });
      return null;
    }

    const prismaClient = getPrisma();
    const account = await prismaClient.kashAccount.findUnique({
      where: { firebaseUid },
    });

    if (!account || !account.encryptedPrivateKey) {
      logger.error('Kash account not found', { requestId, firebaseUid });
      return null;
    }

    const treasuryPublicKey = getTreasuryPublicKey();
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

    logger.info('Treasury transfer succeeded', {
      requestId,
      txHash: transferResult.txHash || null,
    });

    const rawBalance = await getTokenBalance(account.walletPublicKey);
    const now = new Date().toISOString();

    await prismaClient.kashAccount.update({
      where: { id: account.id },
      data: {
        balanceSnapshot: BigInt(rawBalance),
        lastLoginAt: new Date(),
      },
    });

    const balance = Number(rawBalance) / TOKEN_DECIMALS;
    await db.collection('kashAccounts').doc(account.firebaseUid).set(
      {
        balance,
        updatedAt: now,
      },
      { merge: true }
    );

    await prismaClient.kashTransaction.create({
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

    const realtimeUrl = process.env.REALTIME_SERVER_URL;
    if (realtimeUrl) {
      await fetch(`${realtimeUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'finance:update',
          payload: { type: 'cashout', id: requestId, action: 'treasury-transfer' },
        }),
      }).catch(() => undefined);
    }

    return null;
  }
);
