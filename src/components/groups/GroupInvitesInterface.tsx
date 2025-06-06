'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@//components/ui/card';
import { Button } from '@//components/ui/button';
import { Badge } from '@//components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@//components/ui/avatar';
import { Check, X, Mail, Clock, Users, ExternalLink, AlertTriangle, Crown, Shield } from 'lucide-react';
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

  const getRoleConfig = (role: string) => {
    const configs = {
      owner: { 
        color: 'bg-purple-100 text-purple-800',
        icon: Crown 
      },
      'co-owner': { 
        color: 'bg-blue-100 text-blue-800',
        icon: Shield 
      },
      moderator: { 
        color: 'bg-emerald-100 text-emerald-800',
        icon: Shield 
      },
      qa: { 
        color: 'bg-orange-100 text-orange-800',
        icon: Shield 
      },
      uploader: { 
        color: 'bg-gray-100 text-gray-800',
        icon: Users 
      },
      member: { 
        color: 'bg-gray-100 text-gray-600',
        icon: Users 
      },
    };
    return configs[role as keyof typeof configs] || configs.member;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { text: 'Expired', isExpired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return { text: `${days}d left`, isExpired: false };
    if (hours > 0) return { text: `${hours}h left`, isExpired: false };
    return { text: 'Expires soon', isExpired: false };
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
      <div className="min-h-screen bg-background-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-600">Loading invitations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-2">
            Group Invitations
          </h1>
          <p className="text-text-600 text-sm md:text-base mb-4">
            Manage your pending group invitations
          </p>
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            <Mail className="w-4 h-4 mr-1" />
            {invitations.length} pending
          </Badge>
        </div>

        {/* Invitations List */}
        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const roleConfig = getRoleConfig(invitation.role);
              const RoleIcon = roleConfig.icon;
              const timeRemaining = getTimeRemaining(invitation.expiresAt);
              const isExpiring = isExpiringSoon(invitation.expiresAt);
              
              return (
                <Card 
                  key={invitation.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    isExpiring ? 'border-amber-300 bg-amber-50' : 'bg-background-100'
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    {isExpiring && (
                      <Alert className="mb-4 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          This invitation expires soon! Accept it now to join the group.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col space-y-4">
                      {/* Group Info */}
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 border-2 border-primary-200 flex-shrink-0">
                          <AvatarImage src={invitation.group.logoUrl} alt={invitation.group.name} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                            {invitation.group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-text-900 truncate">
                              {invitation.group.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${roleConfig.color} text-xs font-medium`}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {invitation.role.replace('-', ' ')}
                              </Badge>
                              <Badge 
                                variant={invitation.group.status === 'approved' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {invitation.group.status === 'approved' ? 'Active' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-text-600 text-sm mb-3 line-clamp-2">
                            {invitation.group.description || 'No description provided'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-text-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Role: {invitation.role.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className={timeRemaining.isExpired ? 'text-red-600 font-medium' : ''}>
                                {timeRemaining.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center pt-2 border-t border-background-200">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="sm:w-auto"
                        >
                          <Link href={`/groups/${invitation.group.slug}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Group
                          </Link>
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvite(invitation.token, invitation.group.name)}
                            disabled={processingInvites.has(invitation.token)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvite(invitation.token, invitation.group.name)}
                            disabled={processingInvites.has(invitation.token)}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-background-100">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-text-700 mb-2">No pending invitations</h3>
              <p className="text-text-600 mb-6 text-sm">
                You dont have any pending group invitations at the moment.
              </p>
              <Button asChild>
                <Link href="/groups">
                  <Users className="w-4 h-4 mr-2" />
                  Browse Groups
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}