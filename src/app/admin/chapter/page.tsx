import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DynamicChapterApprovalInterface } from '@//components/dynamic/DynamicComponents';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import type { Session } from '@/types';

export const metadata: Metadata = {
  title: 'Group Management - Admin',
  description: 'Manage scanlation group applications and approvals',
};

export default async function AdminGroupsPage() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  }) as Session | null;

  // Check if user is admin (adjust based on your auth system)
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return <DynamicChapterApprovalInterface />;
}