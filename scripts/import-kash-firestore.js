const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const TOKEN_DECIMALS = 1_000_000_000;

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

function toDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return undefined;
}

function toRawAmount(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') {
    if (value.trim() === '') return undefined;
    if (value.includes('.')) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return undefined;
      return BigInt(Math.round(parsed * TOKEN_DECIMALS));
    }
    try {
      return BigInt(value);
    } catch {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return undefined;
      return BigInt(Math.round(parsed * TOKEN_DECIMALS));
    }
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    if (Math.abs(value) > 1e12) {
      return BigInt(Math.round(value));
    }
    return BigInt(Math.round(value * TOKEN_DECIMALS));
  }
  return undefined;
}

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment`);
  }
  return value;
}

function initFirebase() {
  const projectId = getEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = getEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  return getFirestore();
}

async function fetchDocs(db, collectionName) {
  const snap = await db.collection(collectionName).get();
  return snap.docs;
}

function normalizeAccountData(doc) {
  const data = doc.data() || {};
  const firebaseUid = data.firebaseUid || data.uid || data.memberUid || doc.id;
  const email = typeof data.email === 'string' ? data.email : '';
  const displayName = typeof data.displayName === 'string' ? data.displayName : null;
  const walletPublicKey = data.walletPublicKey || data.publicKey || '';
  const encryptedPrivateKey = data.encryptedPrivateKey || data.encrypted_private_key || '';
  const walletId = data.walletId || data.kashAccountId || data.wallet_id || '';
  const status = typeof data.status === 'string' ? data.status : 'ACTIVE';
  const balanceSnapshot = toRawAmount(data.balance ?? data.balanceSnapshot ?? 0) ?? BigInt(0);
  const lastLoginAt = toDate(data.lastLoginAt);

  return {
    firebaseUid,
    email,
    displayName,
    walletPublicKey,
    encryptedPrivateKey,
    walletId,
    status,
    balanceSnapshot,
    lastLoginAt,
  };
}

async function importAccounts(db, prisma) {
  const collections = ['kashAccounts', 'walletAccounts'];
  const accountIdByFirebaseUid = new Map();
  const accountIdSet = new Set();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const collection of collections) {
    let docs = [];
    try {
      docs = await fetchDocs(db, collection);
    } catch {
      continue;
    }

    for (const doc of docs) {
      const account = normalizeAccountData(doc);
      if (!account.firebaseUid || !account.email || !account.walletPublicKey) {
        skipped += 1;
        continue;
      }

      if (!account.encryptedPrivateKey) {
        skipped += 1;
        continue;
      }

      const existing = await prisma.kashAccount.findUnique({
        where: { firebaseUid: account.firebaseUid },
      });

      if (existing) {
        await prisma.kashAccount.update({
          where: { id: existing.id },
          data: {
            email: account.email,
            displayName: account.displayName,
            walletPublicKey: account.walletPublicKey,
            encryptedPrivateKey: account.encryptedPrivateKey,
            balanceSnapshot: account.balanceSnapshot,
            status: account.status,
            lastLoginAt: account.lastLoginAt ?? undefined,
          },
        });
        updated += 1;
        accountIdByFirebaseUid.set(account.firebaseUid, existing.id);
        accountIdSet.add(existing.id);
        continue;
      }

      const createData = {
        id: account.walletId || undefined,
        firebaseUid: account.firebaseUid,
        email: account.email,
        displayName: account.displayName,
        walletPublicKey: account.walletPublicKey,
        encryptedPrivateKey: account.encryptedPrivateKey,
        balanceSnapshot: account.balanceSnapshot,
        status: account.status,
        lastLoginAt: account.lastLoginAt ?? undefined,
      };

      const createdAccount = await prisma.kashAccount.create({
        data: createData,
      });

      created += 1;
      accountIdByFirebaseUid.set(account.firebaseUid, createdAccount.id);
      accountIdSet.add(createdAccount.id);
    }
  }

  return { created, updated, skipped, accountIdByFirebaseUid, accountIdSet };
}

async function importTransactions(db, prisma, accountIdByFirebaseUid, accountIdSet) {
  let created = 0;
  let skipped = 0;
  let missingAccount = 0;

  let docs = [];
  try {
    docs = await fetchDocs(db, 'kashTransactions');
  } catch {
    return { created, skipped, missingAccount };
  }

  for (const doc of docs) {
    const data = doc.data() || {};
    const firebaseUid = data.firebaseUid || data.uid || data.memberUid || '';
    let kashAccountId = data.kashAccountId || data.walletId || '';
    if (!kashAccountId && firebaseUid) {
      kashAccountId = accountIdByFirebaseUid.get(firebaseUid) || '';
    }

    if (!kashAccountId || !accountIdSet.has(kashAccountId)) {
      missingAccount += 1;
      continue;
    }

    const amount = toRawAmount(data.amount) ?? BigInt(0);
    const balanceAfter = toRawAmount(data.balanceAfter);

    try {
      await prisma.kashTransaction.create({
        data: {
          id: doc.id,
          kashAccountId,
          txHash: data.txHash ?? null,
          reference: data.reference ?? null,
          direction: data.direction || 'CREDIT',
          type: data.type || 'TRANSFER',
          sourceApp: data.sourceApp ?? null,
          amount,
          balanceAfter: balanceAfter ?? null,
          status: data.status || 'COMPLETED',
          metadata: data.metadata ?? undefined,
        },
      });
      created += 1;
    } catch (error) {
      if (error && error.code === 'P2002') {
        skipped += 1;
        continue;
      }
      throw error;
    }
  }

  return { created, skipped, missingAccount };
}

async function main() {
  loadEnv();
  const db = initFirebase();
  const prisma = new PrismaClient();

  try {
    const accountResult = await importAccounts(db, prisma);
    const txResult = await importTransactions(
      db,
      prisma,
      accountResult.accountIdByFirebaseUid,
      accountResult.accountIdSet
    );

    console.log('Import complete');
    console.log('Accounts created:', accountResult.created);
    console.log('Accounts updated:', accountResult.updated);
    console.log('Accounts skipped (missing keys):', accountResult.skipped);
    console.log('Transactions created:', txResult.created);
    console.log('Transactions skipped (duplicates):', txResult.skipped);
    console.log('Transactions missing accounts:', txResult.missingAccount);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Import failed:', error.message || error);
  process.exit(1);
});
