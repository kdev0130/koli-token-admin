import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

function encryptPrivateKey(privateKey: Uint8Array): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(Buffer.from(privateKey));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptPrivateKey(encryptedKey: string): Buffer {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

export async function generateWallet(userId: string): Promise<{ publicKey: string; privateKey: string }> {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = encryptPrivateKey(keypair.secretKey);

  await prisma.wallet.create({
    data: {
      userId,
      publicKey,
      encryptedPrivateKey: privateKey,
    },
  });

  return { publicKey, privateKey };
}

export async function getWalletByUserId(userId: string) {
  return prisma.wallet.findUnique({
    where: { userId },
  });
}

export async function getWalletByPublicKey(publicKey: string) {
  return prisma.wallet.findUnique({
    where: { publicKey },
  });
}

export async function getDecryptedPrivateKey(publicKey: string): Promise<Uint8Array | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { publicKey },
  });

  if (!wallet) return null;
  const decrypted = decryptPrivateKey(wallet.encryptedPrivateKey);
  return new Uint8Array(decrypted);
}

export async function getKeypairFromWallet(publicKey: string): Promise<Keypair | null> {
  const privateKey = await getDecryptedPrivateKey(publicKey);
  if (!privateKey) return null;
  return Keypair.fromSecretKey(privateKey);
}
