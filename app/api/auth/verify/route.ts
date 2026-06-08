import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { findUserByVerificationToken, verifyUserEmail } from '@/lib/users';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth?error=invalid-token', request.url));
  }

  const user = await findUserByVerificationToken(token);

  if (!user) {
    return NextResponse.redirect(new URL('/auth?error=invalid-token', request.url));
  }

  if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
    return NextResponse.redirect(new URL('/auth?error=expired-token', request.url));
  }

  await verifyUserEmail(user.email);

  const jwt = await createToken(user.id, user.email);
  const res = NextResponse.redirect(new URL('/dashboard', request.url));
  res.cookies.set('token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
