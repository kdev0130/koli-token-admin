import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { connectToDatabase } from '@/utils/db';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromWallet: wallet.publicKey },
          { toWallet: wallet.publicKey },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const serializedTransactions = transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    }));

    return NextResponse.json({ transactions: serializedTransactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
