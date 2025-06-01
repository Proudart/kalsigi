'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { Button } from '@//components/ui/button';
import { Badge } from '@//components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@//components/ui/avatar';
import { Check, X, Mail, Clock, Users, ExternalLink } from 'lucide-react';
import { useToast } from '@//components/ui/use-toast';
import { Link } from '@//components/link';
import { Alert, AlertDescription } from '@//components/ui/alert';

interface GroupInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  token: string;
  group: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    status: string;
  };
}

export default function GroupInvitesInterface() {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/groups/invites');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        throw new Error('Failed to fetch invitations');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (token: string, groupName: string) => {
    setProcessingInvites(prev => new Set(prev).add(token));
    
    try {
      const response = await fetch(`/api/groups/invites/${token}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Invitation accepted!',
          description: `You've successfully joined ${groupName}`,
        });
        
        // Remove the accepted invitation from the list
        setInvitations(prev => prev.filter(inv => inv.token !== token));
      } else {
        throw new Error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }
  };

  const handleDeclineInvite = async (token: string, groupName: string) => {
    setProcessingInvites(prev => new Set(prev).add(token));
    
    try {
      const response = await fetch(`/api/groups/invites/${token}/decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Invitation declined',
          description: `You've declined the invitation to join ${groupName}`,
        });
        
        // Remove the declined invitation from the list
        setInvitations(prev => prev.filter(inv => inv.token !== token));
      } else {
        throw new Error(data.error || 'Failed to decline invitation');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline invitation',
        variant: 'destructive',
      });
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Expires soon';
  };

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hoursLeft = diff / (1000 * 60 * 60);
    return hoursLeft <= 24 && hoursLeft > 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Group Invitations</h1>
          <p className="text-muted-foreground">
            Manage your pending scanlation group invitations
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Mail className="w-4 h-4" />
          <span>{invitations.length} pending</span>
        </Badge>
      </div>

      {/* Invitations List */}
      {invitations.length > 0 ? (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className={`transition-all duration-200 ${isExpiringSoon(invitation.expiresAt) ? 'border-orange-200 bg-orange-50/50' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={invitation.group.logoUrl} alt={invitation.group.name} />
                      <AvatarFallback>
                        {invitation.group.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{invitation.group.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {invitation.group.description || 'No description provided'}
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Role: {invitation.role.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeRemaining(invitation.expiresAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role.replace('-', ' ')}
                    </Badge>
                    {invitation.group.status === 'approved' ? (
                      <Badge variant="default">Active Group</Badge>
                    ) : (
                      <Badge variant="secondary">Pending Approval</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isExpiringSoon(invitation.expiresAt) && (
                  <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      This invitation expires soon! Accept it now to join the group.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="flex items-center space-x-1"
                    >
                      <Link href={`/groups/${invitation.group.slug}`}>
                        <ExternalLink className="w-4 h-4" />
                        <span>View Group</span>
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineInvite(invitation.token, invitation.group.name)}
                      disabled={processingInvites.has(invitation.token)}
                      className="flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvite(invitation.token, invitation.group.name)}
                      disabled={processingInvites.has(invitation.token)}
                      className="flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No pending invitations</h3>
            <p className="text-muted-foreground mb-6">
              You dont have any pending group invitations at the moment.
            </p>
            <Button asChild>
              <Link href="/groups">Browse Groups</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
