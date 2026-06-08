import prisma from './prisma';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const rows = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows as Task[];
}

export async function getTaskById(userId: string, taskId: string): Promise<Task | null> {
  const row = await prisma.task.findFirst({ where: { id: taskId, userId } });
  return row as Task | null;
}

export async function createTask(
  userId: string,
  data: Pick<Task, 'title' | 'description' | 'dueDate'>
): Promise<Task> {
  const row = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      status: 'pending',
      dueDate: data.dueDate,
    },
  });
  return row as Task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>>
): Promise<Task | null> {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return null;
  const row = await prisma.task.update({
    where: { id: taskId },
    data,
  });
  return row as Task;
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return false;
  await prisma.task.delete({ where: { id: taskId } });
  return true;
}
