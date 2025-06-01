import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import GroupDashboard from '@//components/groups/GroupDashboard';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Group Dashboard',
  description: 'Manage your scanlation group',
};

export default async function GroupPage() {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
    });

  if (!session) {
    redirect('/auth/login');
  }

  return <GroupDashboard />;
}