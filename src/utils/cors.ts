import { NextResponse } from 'next/server';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function withCors(response: NextResponse) {
  Object.entries(DEFAULT_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function buildCorsPreflightResponse() {
  return withCors(new NextResponse(null, { status: 204 }));
}
