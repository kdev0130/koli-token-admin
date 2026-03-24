import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedFirebaseUser } from '@/services/kashService';
import { getWithdrawableSummary } from '@/services/kashWithdrawalService';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedFirebaseUser(request.headers.get('authorization'));
    const summary = await getWithdrawableSummary(decoded.uid);

    return withCors(NextResponse.json({
      success: true,
      totalAvailable: summary.totalAmount,
      contractWithdrawals: summary.contractWithdrawals,
      manaBalance: summary.manaBalance,
      eligibleContracts: summary.eligibleContracts.length,
    }));
  } catch (error: any) {
    return withCors(NextResponse.json({ error: error.message || 'Failed to load withdrawable balance' }, { status: 400 }));
  }
}
