import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenBalance } from '@/services/tokenService';
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

    const rawBalance = await getTokenBalance(wallet.publicKey);
    const balance = Math.floor(rawBalance / 1e9); // Convert from lamports (9 decimals)

    return NextResponse.json({
      publicKey: wallet.publicKey,
      balance,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
