import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedFirebaseUser, syncKashBalance } from '@/services/kashService';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedFirebaseUser(request.headers.get('authorization'));
    const result = await syncKashBalance(decoded.uid);

    return withCors(NextResponse.json({
      success: true,
      balance: result.balance,
      walletPublicKey: result.account.walletPublicKey,
      walletId: result.account.id,
    }));
  } catch (error: any) {
    return withCors(NextResponse.json({ error: error.message || 'Failed to sync K-Kash balance' }, { status: 401 }));
  }
}
