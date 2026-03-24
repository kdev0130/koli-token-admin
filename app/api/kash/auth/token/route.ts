import { NextRequest, NextResponse } from 'next/server';
import { createKashAuthSession } from '@/services/kashService';
import { buildCorsPreflightResponse, withCors } from '@/utils/cors';

export function OPTIONS() {
  return buildCorsPreflightResponse();
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const session = await createKashAuthSession(code);
    return withCors(NextResponse.json(session));
  } catch (error: any) {
    return withCors(NextResponse.json({ error: error.message || 'Failed to create K-Kash session' }, { status: 400 }));
  }
}
