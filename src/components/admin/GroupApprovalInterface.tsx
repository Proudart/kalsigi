'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { Button } from '@//components/ui/button';
import { Badge } from '@//components/ui/badge';
import { Avatar, AvatarFallback } from '@//components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@//components/ui/tabs';
import { Check, X, Eye, Clock, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@//components/ui/use-toast';
import { Alert, AlertDescription } from '@//components/ui/alert';

interface PendingGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  websiteUrl?: string;
  discordUrl?: string;
  status: string;
  createdAt: string;
  createdBy: string;
  creator?: {
    name: string;
    email: string;
  };
  memberCount: number;
}

export default function GroupApprovalInterface() {
  const [pendingGroups, setPendingGroups] = useState<PendingGroup[]>([]);
  const [approvedGroups, setApprovedGroups] = useState<PendingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const [pendingResponse, approvedResponse] = await Promise.all([
        fetch('/api/admin/groups/pending'),
        fetch('/api/admin/groups/approved')
      ]);

      if (pendingResponse.ok) {
        const pending = await pendingResponse.json();
        setPendingGroups(pending);
      }

      if (approvedResponse.ok) {
        const approved = await approvedResponse.json();
        setApprovedGroups(approved);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast({
          title: 'Group approved',
          description: 'The group has been approved successfully.',
        });
        fetchGroups();
      } else {
        throw new Error('Failed to approve group');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve group',
        variant: 'destructive',
      });
    }
  };

  const rejectGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to reject this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast({
          title: 'Group rejected',
          description: 'The group has been rejected.',
        });
        fetchGroups();
      } else {
        throw new Error('Failed to reject group');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject group',
        variant: 'destructive',
      });
    }
  };

  const GroupCard = ({ group, showActions = true }: { group: PendingGroup; showActions?: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription>
              Created by {group.creator?.name || 'Unknown'} • {new Date(group.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={group.status === 'approved' ? 'default' : 'secondary'}>
            {group.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {group.description && (
            <div>
              <h4 className="font-semibold text-sm">Description</h4>
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Members:</span> {group.memberCount}
            </div>
            <div>
              <span className="font-semibold">Slug:</span> /{group.slug}
            </div>
            {group.websiteUrl && (
              <div className="col-span-2">
                <span className="font-semibold">Website:</span>{' '}
                <a href={group.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {group.websiteUrl}
                </a>
              </div>
            )}
            {group.discordUrl && (
              <div className="col-span-2">
                <span className="font-semibold">Discord:</span>{' '}
                <a href={group.discordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {group.discordUrl}
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {group.creator?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{group.creator?.email}</span>
          </div>

          {showActions && group.status === 'pending' && (
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                onClick={() => approveGroup(group.id)}
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectGroup(group.id)}
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/groups/${group.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading groups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Group Management</h1>
          <p className="text-muted-foreground">Review and manage scanlation group applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGroups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedGroups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGroups.length + approvedGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({pendingGroups.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Approved ({approvedGroups.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingGroups.length > 0 ? (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Review each group application carefully. Approved groups will be able to upload content immediately.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                {pendingGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending applications</h3>
                <p className="text-muted-foreground">All group applications have been reviewed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedGroups.length > 0 ? (
            <div className="grid gap-4">
              {approvedGroups.map((group) => (
                <GroupCard key={group.id} group={group} showActions={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No approved groups</h3>
                <p className="text-muted-foreground">No groups have been approved yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
