"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@//components/ui/card";
import { Badge } from "@//components/ui/badge";
import { Button } from "@//components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@//components/ui/tabs";
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
  TrendingUp,
  Calendar,
  Crown,
  Shield,
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
        variant: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
        label: "Pending Review",
      },
      approved: {
        variant: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle,
        label: "Approved",
      },
      suspended: {
        variant: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
        label: "Suspended",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      owner: { icon: Crown, color: "text-purple-600", bg: "bg-purple-100" },
      "co-owner": { icon: Shield, color: "text-blue-600", bg: "bg-blue-100" },
      moderator: { icon: Shield, color: "text-green-600", bg: "bg-green-100" },
      default: { icon: Users, color: "text-gray-600", bg: "bg-gray-100" },
    };
    return configs[role as keyof typeof configs] || configs.default;
  };

  const canManageGroup = ["owner", "co-owner"].includes(group?.userRole || "");
  const canInvite = ["owner", "co-owner", "moderator"].includes(
    group?.userRole || ""
  );
  const canManageSeries = ["owner", "co-owner", "moderator"].includes(
    group?.userRole || ""
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-primary-50/30 to-secondary-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-600">Loading group dashboard...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-primary-50/30 to-secondary-50/20 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-900 mb-2">
              Group Not Found
            </h2>
            <p className="text-text-600">
              The group youre looking for doesnt exist or you dont have
              access to it.
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
    <div className="min-h-screen  py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="overflow-hidden bg-gradient-to-r from-primary-200 to-secondary-300 text-white border-0 shadow-2xl">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        {group.name}
                      </h1>
                      <p className="text-primary-100 text-base sm:text-lg mb-4">
                        {group.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Badge
                        className={`${statusConfig.variant} text-sm font-medium px-3 py-1 border`}
                      >
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <Badge
                        className={`${roleConfig.bg} ${roleConfig.color} text-sm font-medium px-3 py-1`}
                      >
                        <RoleIcon className="w-4 h-4 mr-1" />
                        {group.userRole.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {canInvite && (
                      <Button
                        onClick={() => setShowInviteModal(true)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    )}
                    {canManageSeries && (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Link href={`/groups/${group.slug}/series`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Manage </span>
                          Series
                        </Link>
                      </Button>
                    )}
                    {group.status === "approved" && group.userRole && (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Link href={`/groups/${group.slug}/chapters`}>
                          <Upload className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Upload </span>
                          Content
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 hidden lg:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Warning */}
          {group.status === "pending" && (
            <Card className="mt-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">
                      Pending Approval
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Your group is waiting for admin approval. You can manage
                      settings and invite members, but content upload will be
                      available after approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 min-w-max sm:min-w-0 h-auto">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-3"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-3"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              {canManageGroup && (
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-3"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              )}
              {canManageGroup && (
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-3"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Group Stats */}
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary-800">
                    <BarChart3 className="w-5 h-5" />
                    Group Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-700">
                      Status:
                    </span>
                    <Badge className={`${statusConfig.variant} text-xs border`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-700">
                      Created:
                    </span>
                    <span className="text-sm text-primary-800">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-700">
                      Your Role:
                    </span>
                    <Badge
                      className={`${roleConfig.bg} ${roleConfig.color} text-xs`}
                    >
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {group.userRole.replace("-", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-secondary-800">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canInvite && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 text-sm border-secondary-300 hover:bg-secondary-100"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  )}

                  {canManageSeries && group.status === "approved" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 text-sm border-secondary-300 hover:bg-secondary-100"
                      asChild
                    >
                      <Link href={`/groups/${group.slug}/series`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Manage Series
                      </Link>
                    </Button>
                  )}

                  {group.status === "approved" && group.userRole && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 text-sm border-secondary-300 hover:bg-secondary-100"
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
              <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200 md:col-span-2 xl:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-accent-800">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-accent-400 mx-auto mb-3" />
                    <p className="text-accent-600 text-sm">
                      No recent activity to display.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement
              groupSlug={group.slug}
              userRole={group.userRole}
            />
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
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    View your groups performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-text-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-700 mb-2">
                      Analytics Coming Soon
                    </h3>
                    <p className="text-text-600 max-w-md mx-auto">
                      Were working on comprehensive analytics to help you track
                      your groups performance.
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
