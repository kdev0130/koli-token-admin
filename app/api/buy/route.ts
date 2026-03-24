import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { connectToDatabase } from '@/utils/db';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, paymentMethod, referenceNumber, notes } = await request.json();

    if (!amount || !paymentMethod || !referenceNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const buyOrder = await prisma.buyOrder.create({
      data: {
        userId,
        amount: BigInt(amount),
        paymentMethod,
        referenceNumber,
        notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, buyOrder: { ...buyOrder, amount: Number(buyOrder.amount) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.buyOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const serializedOrders = orders.map(o => ({ ...o, amount: Number(o.amount) }));
    return NextResponse.json({ orders: serializedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
