import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DynamicSeriesApprovalInterface } from '@//components/dynamic/DynamicComponents';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: 'Series Management - Admin',
  description: 'Manage scanlation series applications and approvals',
};

export default async function AdminSeriesPage() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  });
  
  // Check if user is admin (adjust based on your auth system)
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return <DynamicSeriesApprovalInterface />;
}