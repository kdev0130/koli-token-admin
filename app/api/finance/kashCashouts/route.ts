import { NextRequest, NextResponse } from 'next/server';
import type { DocumentData, Query } from 'firebase-admin/firestore';
import { firebaseAdminDb } from '@/lib/firebaseAdmin';
import { requireFinanceUser } from '@/utils/financeGuard';
import { approveKashCashout, rejectKashCashout } from '@/services/kashService';
import { connectToDatabase } from '@/utils/db';
import { notifyRealtime } from '@/utils/realtime';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireFinanceUser(request);

    const { searchParams } = new URL(request.url);
    const pendingOnly = searchParams.get('pending') === 'true';

    let query: Query<DocumentData> = firebaseAdminDb.collection('kashCashouts');
    if (pendingOnly) {
      query = query.where('status', '==', 'PENDING');
    }

    const snap = await query.get();
    const cashouts = snap.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
      id: doc.id,
      ...doc.data(),
    }));

    cashouts.sort((a: any, b: any) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return NextResponse.json({ cashouts });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: error.message || 'Failed to load cashouts' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const financeUser = await requireFinanceUser(request);
    const { requestId, action, reason } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await approveKashCashout({ requestId, approverId: financeUser.id });
      await notifyRealtime('finance:update', { type: 'cashout', id: requestId, action: 'approve' });
      return NextResponse.json({ success: true, result });
    }

    if (action === 'reject') {
      await rejectKashCashout({
        requestId,
        approverId: financeUser.id,
        reason: reason || 'Rejected by finance',
      });
      await notifyRealtime('finance:update', { type: 'cashout', id: requestId, action: 'reject' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: error.message || 'Failed to update cashout' }, { status: 500 });
  }
}
