import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { transferTokens } from '@/services/tokenService';
import { connectToDatabase } from '@/utils/db';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toPublicKey, amount } = await request.json();

    if (!toPublicKey || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const amountInLamports = amount * 1e9; // Convert to lamports (9 decimals)
    const result = await transferTokens(wallet.publicKey, toPublicKey, amountInLamports);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, txHash: result.txHash });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
