import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const res = NextResponse.redirect(new URL('/', origin), { status: 303 });
  res.cookies.set('token', '', { maxAge: 0, path: '/' });
  return res;
}
