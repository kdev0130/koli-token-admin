import { NextRequest, NextResponse } from 'next/server';
import { createSellOrder, getSellOrdersByUser } from '@/services/sellOrderService';
import { connectToDatabase } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, bankName, accountNumber, accountName } = await request.json();

    if (!amount || !bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sellOrder = await createSellOrder({ userId, amount, bankName, accountNumber, accountName });

    return NextResponse.json({ success: true, sellOrder: { ...sellOrder, amount: Number(sellOrder.amount) } });
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

    const orders = await getSellOrdersByUser(userId);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
