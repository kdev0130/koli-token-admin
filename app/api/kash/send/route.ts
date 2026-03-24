import { NextRequest, NextResponse } from 'next/server';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';
import { getVerifiedFirebaseUser, sendKashTransfer } from '@/services/kashService';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedFirebaseUser(request.headers.get('authorization'));
    const { toPublicKey, amount } = await request.json();

    if (!toPublicKey || typeof toPublicKey !== 'string') {
      return withCors(NextResponse.json({ error: 'Recipient address is required' }, { status: 400 }));
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return withCors(NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 }));
    }

    const result = await sendKashTransfer({
      firebaseUid: decoded.uid,
      toPublicKey,
      amount: Number(amount),
    });

    return withCors(NextResponse.json(result));
  } catch (error: any) {
    const message = error?.message || 'Failed to send K-Kash transfer';
    const status = message.includes('bearer token') ? 401 : 400;
    return withCors(NextResponse.json({ error: message }, { status }));
  }
}
