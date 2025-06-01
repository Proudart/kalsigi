import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ChapterApprovalInterface from '@//components/admin/ChapterApprovalInterface';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: 'Group Management - Admin',
  description: 'Manage scanlation group applications and approvals',
};

export default async function AdminGroupsPage() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  });
  
  // Check if user is admin (adjust based on your auth system)
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return <ChapterApprovalInterface />;
}