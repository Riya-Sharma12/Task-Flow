import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getTasksByUser, createTask } from '@/lib/tasks';

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await getTasksByUser(user.userId);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  const task = await createTask(user.userId, {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    dueDate: body.dueDate ?? null,
  });

  return NextResponse.json(task, { status: 201 });
}
