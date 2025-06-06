"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@//components/ui/card";
import { Badge } from "@//components/ui/badge";
import { Button } from "@//components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//components/ui/tabs";
import {
  Users,
  Settings,
  Upload,
  BarChart3,
  UserPlus,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Crown,
  Shield,
  ExternalLink,
} from "lucide-react";
import { GroupSettings } from "./GroupSettings";
import { MemberManagement } from "./MemberManagement";
import { InviteModal } from "./InviteModal";

interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "pending" | "approved" | "suspended";
  createdAt: string;
  userRole: string;
}

export default function GroupDashboard() {
  const params = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [params.slug]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        variant: "bg-amber-100 text-amber-800",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        variant: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle,
        label: "Approved",
      },
      suspended: {
        variant: "bg-red-100 text-red-800",
        icon: AlertTriangle,
        label: "Suspended",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      owner: { icon: Crown, color: "text-purple-600" },
      "co-owner": { icon: Shield, color: "text-blue-600" },
      moderator: { icon: Shield, color: "text-green-600" },
      default: { icon: Users, color: "text-gray-600" },
    };
    return configs[role as keyof typeof configs] || configs.default;
  };

  const canManageGroup = ["owner", "co-owner"].includes(group?.userRole || "");
  const canInvite = ["owner", "co-owner", "moderator"].includes(group?.userRole || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-900 mb-2">Group Not Found</h2>
            <p className="text-text-600 text-sm">
              The group doesnt exist or you dont have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(group.status);
  const roleConfig = getRoleConfig(group.userRole);
  const StatusIcon = statusConfig.icon;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-background-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 truncate">
                    {group.name}
                  </h1>
                  <p className="text-primary-100 text-sm md:text-base mb-3 line-clamp-2">
                    {group.description || "No description provided"}
                  </p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                  <Users className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={`${statusConfig.variant} text-xs font-medium`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <Badge className="bg-white/20 text-white text-xs font-medium">
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {group.userRole.replace("-", " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {canInvite && (
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Link href={`/groups/${group.slug}/series`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Series
                  </Link>
                </Button>
                {group.status === "approved" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Link href={`/groups/${group.slug}/chapters`}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Warning */}
        {group.status === "pending" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Pending Approval</h3>
                  <p className="text-amber-700 text-sm">
                    Your group is awaiting admin approval. You can manage settings but content upload 
                    will be available after approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b border-background-200">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent h-auto p-0">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-background-100"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-background-100"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              {canManageGroup && (
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-background-100"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              )}
              {canManageGroup && (
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-background-100"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Group Stats */}
              <Card className="bg-primary-50 border-primary-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-primary-800">
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-700">Status:</span>
                    <Badge className={`${statusConfig.variant} text-xs`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-700">Created:</span>
                    <span className="text-primary-800">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-700">Role:</span>
                    <span className="text-primary-800 capitalize">{group.userRole.replace("-", " ")}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-secondary-50 border-secondary-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-secondary-800">
                    <Settings className="w-4 h-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {canInvite && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-9 text-sm"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    asChild
                  >
                    <Link href={`/groups/${group.slug}/series`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manage Series
                    </Link>
                  </Button>
                  {group.status === "approved" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-9 text-sm"
                      asChild
                    >
                      <Link href={`/groups/${group.slug}/chapters`}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Content
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-accent-50 border-accent-200 md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-accent-800">
                    <Clock className="w-4 h-4" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-accent-400 mx-auto mb-2" />
                    <p className="text-accent-600 text-sm">No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement groupSlug={group.slug} userRole={group.userRole} />
          </TabsContent>

          {canManageGroup && (
            <TabsContent value="settings">
              <GroupSettings group={group} onUpdate={fetchGroup} />
            </TabsContent>
          )}

          {canManageGroup && (
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-text-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-700 mb-2">Coming Soon</h3>
                    <p className="text-text-600 text-sm">
                      Analytics dashboard is under development
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteModal
            groupSlug={group.slug}
            onClose={() => setShowInviteModal(false)}
            isOpen={showInviteModal}
          />
        )}
      </div>
    </div>
  );
}