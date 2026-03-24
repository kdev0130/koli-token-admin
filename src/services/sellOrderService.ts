import { PrismaClient } from '@prisma/client';
import { transferTokens, transferToTreasury, burnTokens, getTokenBalance } from './tokenService';

const prisma = new PrismaClient();

export interface CreateSellOrderParams {
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export async function createSellOrder(params: CreateSellOrderParams) {
  const { userId, amount, bankName, accountNumber, accountName } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error('Wallet not found');

  const rawBalance = await getTokenBalance(wallet.publicKey);
  const balance = Math.floor(rawBalance / 1e9); // Convert from lamports
  if (balance < amount) throw new Error('Insufficient balance');

  const sellOrder = await prisma.sellOrder.create({
    data: {
      userId,
      amount: BigInt(amount),
      status: 'PENDING',
      bankDetails: JSON.stringify({ bankName, accountNumber, accountName }),
    },
  });

  return sellOrder;
}

export async function getSellOrdersByUser(userId: string) {
  const orders = await prisma.sellOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(o => ({ ...o, amount: Number(o.amount) }));
}

export async function getPendingSellOrders() {
  const orders = await prisma.sellOrder.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });
  return orders.map(o => ({ ...o, amount: Number(o.amount) }));
}

export async function approveSellOrder(sellOrderId: string, approvedBy: string) {
  const sellOrder = await prisma.sellOrder.findUnique({ where: { id: sellOrderId } });
  if (!sellOrder) throw new Error('Sell order not found');
  if (sellOrder.status !== 'PENDING') throw new Error('Order already processed');

  const wallet = await prisma.wallet.findUnique({ where: { userId: sellOrder.userId } });
  if (!wallet) throw new Error('User wallet not found');

  const amountInLamports = Number(sellOrder.amount) * 1e9;
  const result = await transferToTreasury(wallet.publicKey, amountInLamports);

  if (!result.success) {
    throw new Error(`Transfer failed: ${result.error}`);
  }

  await prisma.sellOrder.update({
    where: { id: sellOrderId },
    data: { status: 'APPROVED', approvedBy },
  });

  return result;
}

export async function rejectSellOrder(sellOrderId: string, rejectedBy: string, reason: string) {
  const order = await prisma.sellOrder.update({
    where: { id: sellOrderId },
    data: { status: 'REJECTED', approvedBy: rejectedBy, bankDetails: reason },
  });
  return { ...order, amount: Number(order.amount) };
}

export async function getAllSellOrders() {
  const orders = await prisma.sellOrder.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(o => ({ ...o, amount: Number(o.amount) }));
}
