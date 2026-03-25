import crypto from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { Keypair } from '@solana/web3.js';
import { firebaseAdminAuth, firebaseAdminDb } from '@/lib/firebaseAdmin';
import { prisma } from '@/utils/db';
import type { Prisma } from '@prisma/client';
import { getTokenBalance, getTreasuryKeypair, transferTokensWithKeypair } from '@/services/tokenService';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
export const TOKEN_DECIMALS = 1_000_000_000;

export interface KashAuthSession {
  customToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarInitial: string;
  };
  wallet: {
    walletId: string;
    publicKey: string;
    balance: number;
  };
}

function encryptPrivateKey(privateKey: Uint8Array): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(Buffer.from(privateKey));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptPrivateKey(encryptedKey: string): Uint8Array {
  const [ivHex, encryptedHex] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return new Uint8Array(decrypted);
}

function getKashKeypair(encryptedPrivateKey: string) {
  const secretKey = decryptPrivateKey(encryptedPrivateKey);
  return Keypair.fromSecretKey(secretKey);
}

export function toTokenAmount(rawAmount: bigint | number): number {
  const value = typeof rawAmount === 'bigint' ? Number(rawAmount) : rawAmount;
  return Number((value / TOKEN_DECIMALS).toFixed(9));
}

export function toRawAmount(amount: number): bigint {
  return BigInt(Math.round(amount * TOKEN_DECIMALS));
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function getAvatarInitial(displayName: string, email: string) {
  const base = displayName?.trim() || email;
  return base.charAt(0).toUpperCase();
}

async function ensureFirestoreKashAccount(params: {
  firebaseUid: string;
  email: string;
  displayName: string;
  walletId: string;
  walletPublicKey: string;
  balance: number;
}) {
  const { firebaseUid, email, displayName, walletId, walletPublicKey, balance } = params;
  await firebaseAdminDb.collection('kashAccounts').doc(firebaseUid).set(
    {
      uid: firebaseUid,
      memberUid: firebaseUid,
      email,
      displayName,
      walletId,
      walletPublicKey,
      balance,
      status: 'ACTIVE',
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function refreshKashAccountBalance(account: {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  walletPublicKey: string;
}) {
  const rawBalance = await getTokenBalance(account.walletPublicKey);
  const rawBalanceBigInt = BigInt(rawBalance);
  const updated = await prisma.kashAccount.update({
    where: { id: account.id },
    data: {
      balanceSnapshot: rawBalanceBigInt,
      lastLoginAt: new Date(),
    },
  });

  await ensureFirestoreKashAccount({
    firebaseUid: updated.firebaseUid,
    email: updated.email,
    displayName: updated.displayName || updated.email.split('@')[0],
    walletId: updated.id,
    walletPublicKey: updated.walletPublicKey,
    balance: toTokenAmount(rawBalanceBigInt),
  });

  return { updated, rawBalanceBigInt };
}

export async function upsertKashAccount(params: {
  firebaseUid: string;
  email: string;
  displayName: string;
  lastLoginAt?: Date;
}) {
  const { firebaseUid, email, displayName, lastLoginAt = new Date() } = params;

  const existing = await prisma.kashAccount.findFirst({
    where: {
      OR: [{ firebaseUid }, { email }],
    },
  });

  if (existing) {
    const updated = await prisma.kashAccount.update({
      where: { id: existing.id },
      data: {
        firebaseUid,
        email,
        displayName,
        lastLoginAt,
      },
    });

    await ensureFirestoreKashAccount({
      firebaseUid,
      email,
      displayName,
      walletId: updated.id,
      walletPublicKey: updated.walletPublicKey,
      balance: toTokenAmount(updated.balanceSnapshot),
    });

    return updated;
  }

  const keypair = Keypair.generate();
  const created = await prisma.kashAccount.create({
    data: {
      firebaseUid,
      email,
      displayName,
      walletPublicKey: keypair.publicKey.toBase58(),
      encryptedPrivateKey: encryptPrivateKey(keypair.secretKey),
      lastLoginAt,
    },
  });

  await ensureFirestoreKashAccount({
    firebaseUid,
    email,
    displayName,
    walletId: created.id,
    walletPublicKey: created.walletPublicKey,
    balance: 0,
  });

  return created;
}

async function consumeWalletAuthorization(code: string) {
  const ref = firebaseAdminDb.collection('walletAuthorizations').doc(code);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error('Invalid authorization code');
  }

  const data = snapshot.data() || {};
  if (data.used) {
    throw new Error('Authorization code already used');
  }

  const expiresAt = toDate(data.expiresAt);
  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    throw new Error('Authorization code expired');
  }

  await ref.set(
    {
      used: true,
      usedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  const email = typeof data.email === 'string' ? data.email : '';
  const displayName = typeof data.displayName === 'string' && data.displayName.trim().length
    ? data.displayName.trim()
    : email.split('@')[0] || 'K-Kash User';
  const firebaseUid = typeof data.userId === 'string' ? data.userId : '';

  if (!firebaseUid || !email) {
    throw new Error('Authorization payload is incomplete');
  }

  return {
    firebaseUid,
    email,
    displayName,
    avatarInitial: typeof data.avatarInitial === 'string' && data.avatarInitial.trim().length
      ? data.avatarInitial.trim().charAt(0).toUpperCase()
      : getAvatarInitial(displayName, email),
  };
}

export async function createKashAuthSession(code: string): Promise<KashAuthSession> {
  const authPayload = await consumeWalletAuthorization(code);
  const account = await upsertKashAccount({
    firebaseUid: authPayload.firebaseUid,
    email: authPayload.email,
    displayName: authPayload.displayName,
  });

  const customToken = await firebaseAdminAuth.createCustomToken(authPayload.firebaseUid, {
    app: 'k-kash',
  });

  return {
    customToken,
    user: {
      id: authPayload.firebaseUid,
      email: authPayload.email,
      displayName: authPayload.displayName,
      avatarInitial: authPayload.avatarInitial,
    },
    wallet: {
      walletId: account.id,
      publicKey: account.walletPublicKey,
      balance: toTokenAmount(account.balanceSnapshot),
    },
  };
}

export async function getVerifiedFirebaseUser(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new Error('Missing Firebase bearer token');
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new Error('Missing Firebase bearer token');
  }

  return firebaseAdminAuth.verifyIdToken(token);
}

export async function getKashAccountForFirebaseUser(firebaseUid: string) {
  return prisma.kashAccount.findUnique({
    where: { firebaseUid },
  });
}

export async function syncKashBalance(firebaseUid: string) {
  const account = await prisma.kashAccount.findUnique({
    where: { firebaseUid },
  });

  if (!account) {
    throw new Error('K-Kash account not found');
  }

  const rawBalance = await getTokenBalance(account.walletPublicKey);
  const rawBalanceBigInt = BigInt(rawBalance);
  const balance = toTokenAmount(rawBalanceBigInt);

  const updated = await prisma.kashAccount.update({
    where: { id: account.id },
    data: {
      balanceSnapshot: rawBalanceBigInt,
      lastLoginAt: new Date(),
    },
  });

  await ensureFirestoreKashAccount({
    firebaseUid,
    email: updated.email,
    displayName: updated.displayName || updated.email.split('@')[0],
    walletId: updated.id,
    walletPublicKey: updated.walletPublicKey,
    balance,
  });

  return {
    account: updated,
    balance,
    rawBalance: rawBalanceBigInt,
  };
}

export async function recordKashTransaction(params: {
  kashAccountId: string;
  txHash?: string;
  reference?: string;
  direction: 'CREDIT' | 'DEBIT';
  type: string;
  sourceApp?: string;
  amount: bigint;
  balanceAfter?: bigint;
  status?: string;
  metadata?: Prisma.InputJsonValue | null;
}) {
  const {
    kashAccountId,
    txHash,
    reference,
    direction,
    type,
    sourceApp,
    amount,
    balanceAfter,
    status = 'COMPLETED',
    metadata,
  } = params;

  const transaction = await prisma.kashTransaction.create({
    data: {
      kashAccountId,
      txHash,
      reference,
      direction,
      type,
      sourceApp,
      amount,
      balanceAfter,
      status,
      metadata: metadata ?? undefined,
    },
  });

  const account = await prisma.kashAccount.findUnique({
    where: { id: kashAccountId },
  });

  if (account) {
    await firebaseAdminDb.collection('kashTransactions').doc(transaction.id).set({
      kashAccountId,
      firebaseUid: account.firebaseUid,
      email: account.email,
      displayName: account.displayName,
      walletPublicKey: account.walletPublicKey,
      direction,
      type,
      sourceApp,
      amount: toTokenAmount(amount),
      balanceAfter: balanceAfter ? toTokenAmount(balanceAfter) : 0,
      txHash: txHash ?? null,
      reference: reference ?? null,
      status,
      metadata: metadata ?? {},
      createdAt: transaction.createdAt.toISOString(),
    });
  }

  return transaction;
}

export async function sendKashTransfer(params: {
  firebaseUid: string;
  toPublicKey: string;
  amount: number;
}) {
  const { firebaseUid, toPublicKey, amount } = params;

  if (!toPublicKey || typeof toPublicKey !== 'string') {
    throw new Error('Recipient address is required');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const account = await getKashAccountForFirebaseUser(firebaseUid);
  if (!account) {
    throw new Error('K-Kash account not found');
  }

  const rawAmount = toRawAmount(amount);
  const rawAmountNumber = Number(rawAmount);
  if (!Number.isSafeInteger(rawAmountNumber) || rawAmountNumber <= 0) {
    throw new Error('Amount is invalid');
  }

  const fromKeypair = getKashKeypair(account.encryptedPrivateKey);
  const feePayer = getTreasuryKeypair();
  if (!feePayer) {
    throw new Error('Treasury fee payer not configured');
  }

  const transferResult = await transferTokensWithKeypair(
    fromKeypair,
    toPublicKey,
    rawAmountNumber,
    feePayer
  );

  if (!transferResult.success) {
    throw new Error(transferResult.error || 'Transfer failed');
  }

  const { updated, rawBalanceBigInt: updatedRawBalance } = await refreshKashAccountBalance({
    id: account.id,
    firebaseUid: account.firebaseUid,
    email: account.email,
    displayName: account.displayName,
    walletPublicKey: account.walletPublicKey,
  });

  await recordKashTransaction({
    kashAccountId: updated.id,
    txHash: transferResult.txHash,
    direction: 'DEBIT',
    type: 'KASH_SEND',
    sourceApp: 'K_KASH',
    amount: rawAmount,
    balanceAfter: updatedRawBalance,
    metadata: {
      toPublicKey,
    },
  });

  const recipient = await prisma.kashAccount.findUnique({
    where: { walletPublicKey: toPublicKey },
  });

  if (recipient) {
    const { updated: recipientUpdated, rawBalanceBigInt: recipientRawBalance } = await refreshKashAccountBalance({
      id: recipient.id,
      firebaseUid: recipient.firebaseUid,
      email: recipient.email,
      displayName: recipient.displayName,
      walletPublicKey: recipient.walletPublicKey,
    });

    await recordKashTransaction({
      kashAccountId: recipientUpdated.id,
      txHash: transferResult.txHash,
      direction: 'CREDIT',
      type: 'KASH_RECEIVE',
      sourceApp: 'K_KASH',
      amount: rawAmount,
      balanceAfter: recipientRawBalance,
      metadata: {
        fromPublicKey: account.walletPublicKey,
      },
    });
  }

  return {
    txHash: transferResult.txHash,
    balance: toTokenAmount(updatedRawBalance),
  };
}

export async function createKashCashoutRequest(params: {
  firebaseUid: string;
  amount: number;
  channelId: string;
  channelLabel: string;
  channelType: string;
  accountNumber: string;
  merchantId?: string | null;
  merchantName?: string | null;
}) {
  const { firebaseUid, amount, channelId, channelLabel, channelType, accountNumber, merchantId, merchantName } = params;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const account = await getKashAccountForFirebaseUser(firebaseUid);
  if (!account) {
    throw new Error('K-Kash account not found');
  }

  const rawBalance = await getTokenBalance(account.walletPublicKey);
  const balance = toTokenAmount(BigInt(rawBalance));
  if (amount > balance) {
    throw new Error('Insufficient balance');
  }

  const docRef = firebaseAdminDb.collection('kashCashouts').doc();
  const now = new Date();

  await docRef.set({
    id: docRef.id,
    firebaseUid,
    email: account.email,
    displayName: account.displayName,
    walletPublicKey: account.walletPublicKey,
    amount,
    channelId,
    channelLabel,
    channelType,
    accountNumber,
    merchantId: merchantId ?? null,
    merchantName: merchantName ?? null,
    status: 'PENDING',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  return {
    id: docRef.id,
    status: 'PENDING',
    createdAt: now.toISOString(),
  };
}

export async function approveKashCashout(params: {
  requestId: string;
  approverId: string;
}) {
  const { requestId, approverId } = params;

  const docRef = firebaseAdminDb.collection('kashCashouts').doc(requestId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error('Cashout request not found');

  const data = snap.data() || {};
  if (data.status !== 'PENDING') {
    throw new Error('Cashout request already processed');
  }

  const firebaseUid = String(data.firebaseUid || '');
  const amount = Number(data.amount || 0);
  if (!firebaseUid || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Cashout request is invalid');
  }

  const account = await getKashAccountForFirebaseUser(firebaseUid);
  if (!account) {
    throw new Error('K-Kash account not found');
  }

  const treasuryPublicKey = process.env.TREASURY_PUBLIC_KEY;
  if (!treasuryPublicKey) {
    throw new Error('Treasury wallet not configured');
  }

  const fromKeypair = getKashKeypair(account.encryptedPrivateKey);
  const feePayer = getTreasuryKeypair();
  if (!feePayer) {
    throw new Error('Treasury fee payer not configured');
  }

  const rawAmount = toRawAmount(amount);
  const rawAmountNumber = Number(rawAmount);
  if (!Number.isSafeInteger(rawAmountNumber) || rawAmountNumber <= 0) {
    throw new Error('Amount is invalid');
  }

  const transferResult = await transferTokensWithKeypair(
    fromKeypair,
    treasuryPublicKey,
    rawAmountNumber,
    feePayer
  );

  if (!transferResult.success) {
    throw new Error(transferResult.error || 'Treasury transfer failed');
  }

  const { rawBalanceBigInt } = await refreshKashAccountBalance({
    id: account.id,
    firebaseUid: account.firebaseUid,
    email: account.email,
    displayName: account.displayName,
    walletPublicKey: account.walletPublicKey,
  });

  await recordKashTransaction({
    kashAccountId: account.id,
    txHash: transferResult.txHash,
    direction: 'DEBIT',
    type: 'KASH_CASHOUT',
    sourceApp: 'K_KASH',
    amount: rawAmount,
    balanceAfter: rawBalanceBigInt,
    metadata: {
      cashoutRequestId: requestId,
      channelId: data.channelId,
      channelLabel: data.channelLabel,
      channelType: data.channelType,
    },
  });

  await docRef.set(
    {
      status: 'APPROVED',
      txHash: transferResult.txHash,
      approvedBy: approverId,
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  const createdAt = data.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();
  await firebaseAdminDb.collection('odhexWithdrawals').doc(requestId).set(
    {
      id: requestId,
      userId: firebaseUid,
      userEmail: String(data.email || account.email || ''),
      leaderName: data.leaderName ?? null,
      leaderId: data.leaderId ?? null,
      amount,
      provider: String(data.channelLabel || data.channelId || 'ODHex'),
      method: String(data.channelType || 'ewallet'),
      accountDetails: String(data.accountNumber || ''),
      status: 'pending',
      requestedAt: createdAt,
      processedAt: null,
      processedBy: null,
      transactionHash: transferResult.txHash || null,
      updatedAt,
    },
    { merge: true }
  );

  return {
    txHash: transferResult.txHash,
  };
}

export async function rejectKashCashout(params: {
  requestId: string;
  approverId: string;
  reason: string;
}) {
  const { requestId, approverId, reason } = params;

  const docRef = firebaseAdminDb.collection('kashCashouts').doc(requestId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error('Cashout request not found');

  const data = snap.data() || {};
  if (data.status !== 'PENDING') {
    throw new Error('Cashout request already processed');
  }

  await docRef.set(
    {
      status: 'REJECTED',
      rejectedBy: approverId,
      rejectionReason: reason || 'Rejected by finance',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { success: true };
}
