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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@//components/ui/card";
import { useToast } from "@//components/ui/use-toast";
import {
  Loader2,
  Users,
  Globe,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
        description:
          "Your group is pending approval. You'll be notified once it's approved.",
      });

      router.push(`/groups/${group.slug}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-4 px-4 sm:py-8">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full mb-4 sm:mb-6">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-900 mb-2 sm:mb-4">
            Create Your Scanlation Group
          </h1>
          <p className="text-base sm:text-lg text-text-600 max-w-2xl mx-auto">
            Start your own scanlation group and bring amazing manga content to
            readers worldwide
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-background-50/80 border-background-200 shadow-xl">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-text-900">
              Group Information
            </CardTitle>
            <CardDescription className="text-text-600">
              Tell us about your scanlation group
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 sm:space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Group Name */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-text-700 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Group Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="My Awesome Scanlation Group"
                      disabled={isLoading}
                      className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name.message}
                      </p>
                    )}
                    {slug && (
                      <div className="bg-background-100 rounded-lg p-3 border border-background-200">
                        <p className="text-sm text-text-600 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          URL Preview:{" "}
                          <span className="font-mono text-primary-600">
                            /groups/{slug}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-text-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Tell people about your scanlation group, your mission, and what makes you special..."
                      rows={4}
                      disabled={isLoading}
                      className="text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20 resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Website URL */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="websiteUrl"
                      className="text-sm font-semibold text-text-700 flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website URL
                    </Label>
                    <Input
                      id="websiteUrl"
                      {...register("websiteUrl")}
                      placeholder="https://yourgroup.com"
                      disabled={isLoading}
                      className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                    />
                    {errors.websiteUrl && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.websiteUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Discord URL */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="discordUrl"
                      className="text-sm font-semibold text-text-700 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Discord URL
                    </Label>
                    <Input
                      id="discordUrl"
                      {...register("discordUrl")}
                      placeholder="https://discord.gg/yourserver"
                      disabled={isLoading}
                      className="h-12 text-base border-background-300 focus:border-primary-500 focus:ring-primary-500/20"
                    />
                    {errors.discordUrl && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.discordUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Important Notes */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-800 mb-2">
                          Important Notes
                        </h4>
                        <ul className="text-sm text-primary-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                            <span>
                              Your group will be reviewed by moderators
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                            <span>You'll become the group owner</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                            <span>Only approved groups can upload content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                            <span>Group names must be unique</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Group...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Create Group
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
