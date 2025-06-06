"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@//components/ui/button";
import { Input } from "@//components/ui/input";
import { Textarea } from "@//components/ui/textarea";
import { Label } from "@//components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@//components/ui/card";
import { useToast } from "@//components/ui/use-toast";
import { Loader2, Users, Globe, MessageCircle, AlertCircle } from "lucide-react";

const CreateGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  discordUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
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

  const groupName = watch("name", "");
  const slug = groupName
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const onSubmit = async (data: CreateGroupData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create group");
      }

      const group = await response.json();
      toast({
        title: "Group created successfully!",
        description: "Your group is pending approval. You'll be notified once it's approved.",
      });

      router.push(`/groups/${group.slug}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-2">
            Create Your Group
          </h1>
          <p className="text-text-600 text-sm md:text-base">
            Start your own scanlation group and connect with readers
          </p>
        </div>

        <Card className="bg-background-100 border-background-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">Group Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-text-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="My Awesome Group"
                  disabled={isLoading}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name.message}
                  </p>
                )}
                {slug && (
                  <div className="bg-background-200 rounded-lg p-3 border border-background-300">
                    <p className="text-sm text-text-600 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      URL: <span className="font-mono text-primary-600">/groups/{slug}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-text-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Tell people about your group..."
                  rows={4}
                  disabled={isLoading}
                  className="resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-sm font-medium text-text-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    {...register("websiteUrl")}
                    placeholder="https://yourgroup.com"
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-red-600">{errors.websiteUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discordUrl" className="text-sm font-medium text-text-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Discord URL
                  </Label>
                  <Input
                    id="discordUrl"
                    {...register("discordUrl")}
                    placeholder="https://discord.gg/yourserver"
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.discordUrl && (
                    <p className="text-sm text-red-600">{errors.discordUrl.message}</p>
                  )}
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-primary-800 mb-2">Important Notes</h4>
                    <ul className="text-sm text-primary-700 space-y-1">
                      <li>• Groups require admin approval</li>
                      <li>• Youll become the group owner</li>
                      <li>• Names must be unique</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Create Group
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}