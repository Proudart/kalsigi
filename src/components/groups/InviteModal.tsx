'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@//components/ui/dialog';
import { Button } from '@//components/ui/button';
import { Input } from '@//components/ui/input';
import { Label } from '@//components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@//components/ui/select';
import { useToast } from '@//components/ui/use-toast';
import { Loader2, Mail, UserPlus, Crown, Shield, Users, Upload, Eye } from 'lucide-react';

const InviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'uploader', 'qa', 'moderator', 'co-owner']),
});

type InviteData = z.infer<typeof InviteSchema>;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupSlug: string;
}

export function InviteModal({ isOpen, onClose, groupSlug }: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<InviteData>({
    resolver: zodResolver(InviteSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: InviteData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupSlug}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      toast({
        title: 'Invitation sent!',
        description: `An invitation has been sent to ${data.email}`,
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'member',
      label: 'Member',
      description: 'Can view group content and participate in discussions',
      icon: Users,
      color: 'text-gray-600'
    },
    {
      value: 'uploader',
      label: 'Uploader',
      description: 'Can upload and manage content',
      icon: Upload,
      color: 'text-blue-600'
    },
    {
      value: 'qa',
      label: 'Quality Assurance',
      description: 'Can upload content and moderate submissions',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      value: 'moderator',
      label: 'Moderator',
      description: 'Can manage content, invite members, and moderate group',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      value: 'co-owner',
      label: 'Co-Owner',
      description: 'Has full management permissions except deleting the group',
      icon: Crown,
      color: 'text-orange-600'
    },
  ];

  const selectedRoleData = roleOptions.find(role => role.value === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background-50/95 backdrop-blur-sm border-background-300">
        <DialogHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-text-900">
            Invite New Member
          </DialogTitle>
          <DialogDescription className="text-text-600">
            Send an invitation to join your scanlation group and start collaborating together.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {/* Email Input */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-text-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="member@example.com"
              disabled={isLoading}
              className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-semibold text-text-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role *
            </Label>
            <Select onValueChange={(value) => setValue('role', value as any)} disabled={isLoading}>
              <SelectTrigger className="h-12 border-background-300 focus:border-primary-500 focus:ring-primary-500/20">
                <SelectValue placeholder="Select a role for this member" />
              </SelectTrigger>
              <SelectContent className='bg-background-50 border border-background-300 rounded-lg shadow-lg'>
                {roleOptions.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <SelectItem key={role.value} value={role.value} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-background-100 flex items-center justify-center ${role.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-text-500 max-w-xs">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Selected Role Info */}
          {selectedRoleData && (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-background-100 flex items-center justify-center ${selectedRoleData.color} flex-shrink-0`}>
                  <selectedRoleData.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 mb-1">{selectedRoleData.label} Permissions</h4>
                  <p className="text-sm text-primary-700">{selectedRoleData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 h-12 border-background-300 hover:bg-background-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}