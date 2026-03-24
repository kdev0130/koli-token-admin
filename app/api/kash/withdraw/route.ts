import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedFirebaseUser } from '@/services/kashService';
import { withdrawToKash } from '@/services/kashWithdrawalService';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedFirebaseUser(request.headers.get('authorization'));
    const body = await request.json();
    const amount = Number(body.amount);
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!Number.isFinite(amount) || amount <= 0) {
      return withCors(NextResponse.json({ error: 'A valid withdrawal amount is required' }, { status: 400 }));
    }

    if (!pin) {
      return withCors(NextResponse.json({ error: 'PIN verification is required' }, { status: 400 }));
    }

    const result = await withdrawToKash({
      firebaseUid: decoded.uid,
      amount,
      pin,
    });

    return withCors(NextResponse.json({
      success: true,
      txHash: result.txHash,
      balance: result.balance,
      withdrawalSessionId: result.withdrawalSessionId,
    }));
  } catch (error: any) {
    return withCors(NextResponse.json({ error: error.message || 'K-Kash withdrawal failed' }, { status: 400 }));
  }
}
