import prisma from './prisma';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string | null;
  verificationExpires?: Date | null;
  createdAt: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserByVerificationToken(token: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { verificationToken: token } });
}

export async function createUser(
  email: string,
  passwordHash: string,
  verificationToken: string
): Promise<User> {
  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function verifyUserEmail(email: string): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
    },
  });
}
