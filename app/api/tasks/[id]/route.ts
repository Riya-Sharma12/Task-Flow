import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getTaskById, updateTask, deleteTask } from '@/lib/tasks';

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const task = await getTaskById(user.userId, params.id);
  if (!task) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });

  const updates: Parameters<typeof updateTask>[2] = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.status !== undefined) updates.status = body.status;
  if ('dueDate' in body) updates.dueDate = body.dueDate;

  const updated = await updateTask(user.userId, params.id, updates);
  if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await deleteTask(user.userId, params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
