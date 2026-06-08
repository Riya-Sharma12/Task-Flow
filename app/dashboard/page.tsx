import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import TaskBoard from './TaskBoard';

export default async function DashboardPage() {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/auth');

  let email = '';
  let userId = '';
  try {
    const payload = await verifyToken(token);
    email = payload.email;
    userId = payload.userId;
  } catch {
    redirect('/auth');
  }

  return <TaskBoard email={email} userId={userId} />;
}
