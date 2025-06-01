
import { Metadata } from 'next';
import GroupsPageComponent from '@//components/groups/GroupsInfo';

export const metadata: Metadata = {
  title: 'View Scanlation Groups',
  description: 'View and manage your scanlation groups and their manga content',
};

export default async function GroupsPage() {
  return (
    <div className="container mx-auto py-8">
      <GroupsPageComponent />
    </div>
  );
}       