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
import { Loader2 } from 'lucide-react';

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
  } = useForm<InviteData>({
    resolver: zodResolver(InviteSchema),
  });

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

  const roleDescriptions = {
    member: 'Can view group content and participate in discussions',
    uploader: 'Can upload and manage content',
    qa: 'Can upload content and moderate submissions',
    moderator: 'Can manage content, invite members, and moderate group',
    'co-owner': 'Has full management permissions except deleting the group',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your scanlation group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="user@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select onValueChange={(value) => setValue('role', value as any)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleDescriptions).map(([role, description]) => (
                  <SelectItem key={role} value={role}>
                    <div>
                      <div className="font-medium capitalize">{role.replace('-', ' ')}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}