import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getPendingSellOrders, getAllSellOrders, approveSellOrder, rejectSellOrder } from '@/services/sellOrderService';
import { connectToDatabase } from '@/utils/db';
import { notifyRealtime } from '@/utils/realtime';

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

    const { searchParams } = new URL(request.url);
    const pending = searchParams.get('pending');

    const orders = pending === 'true' ? await getPendingSellOrders() : await getAllSellOrders();

    const serializedOrders = orders.map((order) => ({
      ...order,
      amount: Number(order.amount),
    }));

    return NextResponse.json({ orders: serializedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { orderId, action, reason } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      result = await approveSellOrder(orderId, userId);
    } else if (action === 'reject') {
      result = await rejectSellOrder(orderId, userId, reason || 'Rejected by finance');
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await notifyRealtime('finance:update', { type: 'sellOrder', id: orderId, action });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
