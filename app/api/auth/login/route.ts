import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/users';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const { email, password } = body as { email: string; password: string };

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: 'Please verify your email before signing in.' },
      { status: 403 }
    );
  }

  const token = await createToken(user.id, user.email);

  const res = NextResponse.json({ success: true });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
