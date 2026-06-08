import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'indexcard-dev-secret-do-not-use-in-production'
);

export async function createToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; email: string; exp: number; iat: number };
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    keyMaterial,
    256
  );
  const result = new Uint8Array(16 + 32);
  result.set(salt, 0);
  result.set(new Uint8Array(derived), 16);
  return Buffer.from(result).toString('hex');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const combined = Buffer.from(storedHash, 'hex');
  const salt = combined.subarray(0, 16);
  const expectedHash = combined.subarray(16);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    keyMaterial,
    256
  );
  const derivedArray = new Uint8Array(derived);
  if (derivedArray.length !== expectedHash.length) return false;
  return derivedArray.every((b, i) => b === expectedHash[i]);
}
