import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import GroupCreationForm from '@//components/groups/GroupCreationForm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Create Scanlation Group',
  description: 'Create your own scanlation group to upload and manage manga content',
};

export default async function CreateGroupPage() {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
    });

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-8">
      <GroupCreationForm />
    </div>
  );
}