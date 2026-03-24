import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenBalance } from '@/services/tokenService';
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

    const where = pending === 'true' ? { status: 'PENDING' } : {};

    const orders = await prisma.buyOrder.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const serializedOrders = orders.map(o => ({
      ...o,
      amount: Number(o.amount)
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

    const buyOrder = await prisma.buyOrder.findUnique({ 
      where: { id: orderId },
      include: { user: true }
    });
    
    if (!buyOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const userWallet = await prisma.wallet.findUnique({ 
        where: { userId: buyOrder.userId }
      });
      
      if (!userWallet) {
        return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
      }

      const amountInLamports = Number(buyOrder.amount) * 1e9;

      // Transfer tokens from treasury to user
      const { transferFromTreasury } = await import('@/services/tokenService');
      const result = await transferFromTreasury(userWallet.publicKey, amountInLamports);

      if (!result.success) {
        return NextResponse.json({ error: `Transfer failed: ${result.error}` }, { status: 400 });
      }

      await prisma.buyOrder.update({
        where: { id: orderId },
        data: { status: 'APPROVED', approvedBy: userId },
      });

      await notifyRealtime('finance:update', { type: 'buyOrder', id: orderId, action: 'approve' });
      return NextResponse.json({ success: true, txHash: result.txHash });
    } else if (action === 'reject') {
      await prisma.buyOrder.update({
        where: { id: orderId },
        data: { status: 'REJECTED', approvedBy: userId },
      });

      await notifyRealtime('finance:update', { type: 'buyOrder', id: orderId, action: 'reject' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
