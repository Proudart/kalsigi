'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { Button } from '@//components/ui/button';
import { Input } from '@//components/ui/input';
import { Textarea } from '@//components/ui/textarea';
import { Label } from '@//components/ui/label';
import { useToast } from '@//components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@//components/ui/alert';

const UpdateGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  discordUrl: z.string().url().optional().or(z.literal('')),
});

type UpdateGroupData = z.infer<typeof UpdateGroupSchema>;

interface GroupSettingsProps {
  group: any;
  onUpdate: () => void;
}

export function GroupSettings({ group, onUpdate }: GroupSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGroupData>({
    resolver: zodResolver(UpdateGroupSchema),
    defaultValues: {
      name: group.name,
      description: group.description || '',
      websiteUrl: group.websiteUrl || '',
      discordUrl: group.discordUrl || '',
    },
  });

  const onSubmit = async (data: UpdateGroupData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update group');
      }

      toast({
        title: 'Settings updated',
        description: 'Your group settings have been updated successfully.',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update group',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>
            Update your group information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                {...register('websiteUrl')}
                disabled={isLoading}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-red-600">{errors.websiteUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discordUrl">Discord URL</Label>
              <Input
                id="discordUrl"
                {...register('discordUrl')}
                disabled={isLoading}
              />
              {errors.discordUrl && (
                <p className="text-sm text-red-600">{errors.discordUrl.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone - Only for owners */}
      {group.userRole === 'owner' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Deleting your group will permanently remove all data, members, and uploaded content.
                This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button 
                variant="destructive" 
                onClick={() => setShowDangerZone(true)}
                disabled={showDangerZone}
              >
                Delete Group
              </Button>
            </div>

            {showDangerZone && (
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-800 mb-3">
                  Type <code className="bg-red-100 px-1 rounded">DELETE {group.name}</code> to confirm deletion:
                </p>
                <div className="flex space-x-2">
                  <Input placeholder={`DELETE ${group.name}`} className="flex-1" />
                  <Button variant="destructive" size="sm">
                    Delete Forever
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDangerZone(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}