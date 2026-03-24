import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTreasuryBalance, mintTokensToTreasury } from '@/services/tokenService';
import { connectToDatabase } from '@/utils/db';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'FINANCE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const treasuryPublicKey = process.env.TREASURY_PUBLIC_KEY || '';
    const rawBalance = await getTreasuryBalance();
    const balance = Math.floor(rawBalance / 1e9); // Convert from lamports (9 decimals)

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const serializedTransactions = transactions.map(
      (transaction: { amount: bigint } & Record<string, unknown>) => ({
        ...transaction,
        amount: Number(transaction.amount),
      })
    );

    return NextResponse.json({ balance, treasuryPublicKey, transactions: serializedTransactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'FINANCE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const result = await mintTokensToTreasury(amount);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, txHash: result.txHash });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
