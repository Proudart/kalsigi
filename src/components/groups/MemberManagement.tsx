'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@//components/ui/card';
import { Badge } from '@//components/ui/badge';
import { Button } from '@//components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@//components/ui/select';
import { Avatar, AvatarFallback } from '@//components/ui/avatar';
import { MoreHorizontal, UserMinus, Crown, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@//components/ui/drop-down-menu';
import { useToast } from '@//components/ui/use-toast';

interface Member {
  role: string;
  joinedAt: string;
  status: string;
  name: string;
}

interface MemberManagementProps {
  groupSlug: string;
  userRole: string;
}

export function MemberManagement({ groupSlug, userRole }: MemberManagementProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const canManageMembers = ['owner', 'co-owner', 'moderator'].includes(userRole);
  const canRemoveMembers = ['owner', 'co-owner'].includes(userRole);

  useEffect(() => {
    fetchMembers();
  }, [groupSlug]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast({ title: 'Member role updated successfully' });
        fetchMembers();
      } else {
        throw new Error('Failed to update member role');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/groups/${groupSlug}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Member removed successfully' });
        fetchMembers();
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'co-owner':
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      'co-owner': 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800',
      qa: 'bg-orange-100 text-orange-800',
      uploader: 'bg-gray-100 text-gray-800',
      member: 'bg-gray-100 text-gray-600',
    };
    return colors[role as keyof typeof colors] || colors.member;
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {member.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{member.name || 'Unknown User'}</span>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role.replace('-', ' ')}
                </Badge>

                {canManageMembers && member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {/* Show role change dialog */}}>
                        Change Role
                      </DropdownMenuItem>
                      {canRemoveMembers && (
                        <DropdownMenuItem
                          onClick={() => removeMember(member.name)}
                          className="text-red-600"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No members found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
