import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/users';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const { email, password } = body as { email: string; password: string };

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = crypto.randomUUID();
  await createUser(email, passwordHash, verificationToken);

  const { devUrl } = await sendVerificationEmail(email, verificationToken);

  return NextResponse.json({ requiresVerification: true, devUrl: devUrl ?? null });
}
