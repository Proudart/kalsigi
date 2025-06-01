'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@//components/ui/button';
import { Input } from '@//components/ui/input';
import { Textarea } from '@//components/ui/textarea';
import { Label } from '@//components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { useToast } from '@//components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const CreateGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  discordUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CreateGroupData = z.infer<typeof CreateGroupSchema>;

export default function GroupCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateGroupData>({
    resolver: zodResolver(CreateGroupSchema),
  });

  const groupName = watch('name', '');
  const slug = groupName
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  const onSubmit = async (data: CreateGroupData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      const group = await response.json();
      toast({
        title: 'Group created successfully!',
        description: 'Your group is pending approval. You\'ll be notified once it\'s approved.',
      });
      
      router.push(`/groups/${group.slug}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create group',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Scanlation Group</CardTitle>
        <CardDescription>
          Create your own scanlation group to upload and manage manga content.
          Your group will need approval before becoming active.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Awesome Scanlation Group"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
            {slug && (
              <p className="text-sm text-muted-foreground">
                URL: /groups/{slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Tell people about your scanlation group..."
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
              placeholder="https://yourgroup.com"
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
              placeholder="https://discord.gg/yourserver"
              disabled={isLoading}
            />
            {errors.discordUrl && (
              <p className="text-sm text-red-600">{errors.discordUrl.message}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Your group will be reviewed by our moderators before approval</li>
              <li>• You will be the group owner and can invite other members</li>
              <li>• Only approved groups can upload content</li>
              <li>• Group names must be unique and appropriate</li>
            </ul>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}