import { NextRequest, NextResponse } from 'next/server';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';
import { getVerifiedFirebaseUser, createKashCashoutRequest } from '@/services/kashService';
import { notifyRealtime } from '@/utils/realtime';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedFirebaseUser(request.headers.get('authorization'));
    const { amount, channelId, channelLabel, channelType, accountNumber, merchantId, merchantName } = await request.json();

    if (!channelId || !channelLabel || !channelType || !accountNumber) {
      return withCors(NextResponse.json({ error: 'Missing payout details' }, { status: 400 }));
    }

    const result = await createKashCashoutRequest({
      firebaseUid: decoded.uid,
      amount: Number(amount),
      channelId: String(channelId),
      channelLabel: String(channelLabel),
      channelType: String(channelType),
      accountNumber: String(accountNumber),
      merchantId: merchantId ? String(merchantId) : null,
      merchantName: merchantName ? String(merchantName) : null,
    });

    await notifyRealtime('finance:update', { type: 'cashout', id: result.id });
    return withCors(NextResponse.json(result));
  } catch (error: any) {
    const message = error?.message || 'Failed to submit cashout request';
    const status = message.includes('bearer token') ? 401 : 400;
    return withCors(NextResponse.json({ error: message }, { status }));
  }
}
