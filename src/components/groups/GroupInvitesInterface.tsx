'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
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
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Crown 
      },
      'co-owner': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Shield 
      },
      moderator: { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Shield 
      },
      qa: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Users 
      },
      uploader: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Users 
      },
      member: { 
        color: 'bg-gray-100 text-gray-600 border-gray-200',
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
    
    if (days > 0) return { text: `${days} day${days > 1 ? 's' : ''} left`, isExpired: false };
    if (hours > 0) return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, isExpired: false };
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
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-primary-50/30 to-secondary-50/20 py-4 sm:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-600">Loading invitations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-50 via-primary-50/30 to-secondary-50/20 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full mb-4 sm:mb-6">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-900 mb-2 sm:mb-4">
            Group Invitations
          </h1>
          <p className="text-base sm:text-lg text-text-600 max-w-2xl mx-auto mb-4">
            Manage your pending scanlation group invitations
          </p>
          <Badge variant="secondary" className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium">
            <Mail className="w-4 h-4" />
            <span>{invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}</span>
          </Badge>
        </div>

        {/* Invitations List */}
        {invitations.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {invitations.map((invitation) => {
              const roleConfig = getRoleConfig(invitation.role);
              const RoleIcon = roleConfig.icon;
              const timeRemaining = getTimeRemaining(invitation.expiresAt);
              const isExpiring = isExpiringSoon(invitation.expiresAt);
              
              return (
                <Card 
                  key={invitation.id} 
                  className={`transition-all duration-200 hover:shadow-lg ${
                    isExpiring ? 'border-amber-300 bg-gradient-to-r from-amber-50/50 to-orange-50/50' : 
                    'bg-background-50/80 backdrop-blur-sm'
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    {isExpiring && (
                      <Alert className="mb-4 border-amber-200 bg-amber-50/80">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 font-medium">
                          This invitation expires soon! Accept it now to join the group.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Group Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary-200">
                          <AvatarImage src={invitation.group.logoUrl} alt={invitation.group.name} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold text-lg">
                            {invitation.group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-text-900 truncate">
                              {invitation.group.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${roleConfig.color} text-xs font-medium border`}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {invitation.role.replace('-', ' ')}
                              </Badge>
                              {invitation.group.status === 'approved' ? (
                                <Badge className="bg-emerald-100 text-emerald-800 text-xs border-emerald-200">
                                  Active Group
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Pending Approval
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-text-600 text-sm sm:text-base mb-3 line-clamp-2">
                            {invitation.group.description || 'No description provided'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>Role: {invitation.role.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className={timeRemaining.isExpired ? 'text-red-600 font-medium' : ''}>
                                {timeRemaining.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-start">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="flex items-center gap-2 min-w-0"
                        >
                          <Link href={`/groups/${invitation.group.slug}`}>
                            <ExternalLink className="w-4 h-4" />
                            <span>View Group</span>
                          </Link>
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvite(invitation.token, invitation.group.name)}
                            disabled={processingInvites.has(invitation.token)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvite(invitation.token, invitation.group.name)}
                            disabled={processingInvites.has(invitation.token)}
                            className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
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
          <Card className="bg-background-50/80 backdrop-blur-sm">
            <CardContent className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-700 mb-2">No pending invitations</h3>
              <p className="text-text-600 mb-6 max-w-md mx-auto">
                You dont have any pending group invitations at the moment. 
                Explore groups and connect with the scanlation community!
              </p>
              <Button asChild className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700">
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