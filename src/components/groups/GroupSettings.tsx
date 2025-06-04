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
import { Loader2, AlertTriangle, Save, Users, Globe, MessageCircle, Trash2 } from 'lucide-react';
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
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
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

  const handleDeleteGroup = async () => {
    if (deleteConfirmation !== `DELETE ${group.name}`) {
      toast({
        title: 'Invalid confirmation',
        description: 'Please type the exact text to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete group');
      }

      toast({
        title: 'Group deleted',
        description: 'Your group has been permanently deleted.',
      });

      // Redirect to groups page or dashboard
      window.location.href = '/groups';
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete group',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* General Settings */}
      <Card className="bg-background-50/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            Group Settings
          </CardTitle>
          <CardDescription className="text-base">
            Update your group information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-text-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Group Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={isLoading}
                    className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="websiteUrl" className="text-sm font-semibold text-text-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    {...register('websiteUrl')}
                    disabled={isLoading}
                    placeholder="https://yourgroup.com"
                    className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="discordUrl" className="text-sm font-semibold text-text-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Discord URL
                  </Label>
                  <Input
                    id="discordUrl"
                    {...register('discordUrl')}
                    disabled={isLoading}
                    placeholder="https://discord.gg/yourserver"
                    className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                  {errors.discordUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.discordUrl.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-text-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={6}
                    disabled={isLoading}
                    placeholder="Tell people about your scanlation group..."
                    className="text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-12 px-8 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone - Only for owners */}
      {group.userRole === 'owner' && (
        <Card className="border-red-300 bg-gradient-to-r from-red-50/50 to-pink-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-red-700 flex items-center gap-2 text-xl sm:text-2xl">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600">
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Alert className="border-red-200 bg-red-50/80 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Deleting your group will permanently remove all data, members, and uploaded content.
                This action cannot be undone and all associated content will be lost forever.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDangerZone(!showDangerZone)}
                disabled={isLoading}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDangerZone ? 'Cancel' : 'Delete Group'}
              </Button>

              {showDangerZone && (
                <div className="bg-red-50/80 border border-red-200 rounded-lg p-4 sm:p-6 space-y-4">
                  <div>
                    <p className="text-sm text-red-800 mb-3 font-medium">
                      Type <code className="bg-red-100 px-2 py-1 rounded text-xs font-mono">DELETE {group.name}</code> to confirm deletion:
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={`DELETE ${group.name}`}
                      className="border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleDeleteGroup}
                      disabled={isLoading || deleteConfirmation !== `DELETE ${group.name}`}
                      className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Forever
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowDangerZone(false);
                        setDeleteConfirmation('');
                      }}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}