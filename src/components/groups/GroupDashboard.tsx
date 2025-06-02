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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const canManageGroup = ["owner", "co-owner"].includes(group?.userRole || "");
  const canInvite = ["owner", "co-owner", "moderator"].includes(
    group?.userRole || ""
  );
  const canManageSeries = ["owner", "co-owner", "moderator"].includes(
    group?.userRole || ""
  );

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!group) {
    return <div className="container mx-auto py-8">Group not found</div>;
  }

  return (
    <>
      <div className="container mx-auto py-8 space-y-6">
        {/* Group Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{group.name}</CardTitle>
                <CardDescription className="mt-2">
                  {group.description || "No description provided"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(group.status)}
                <Badge variant="outline">{group.userRole}</Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {canInvite && (
                <Button onClick={() => setShowInviteModal(true)} size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
              {canManageSeries && (
                <Link href={`/groups/${group.slug}/series`}>
                  <Button variant="outline" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Manage Series
                  </Button>
                </Link>
              )}
              {group.status === "approved" && group.userRole && (
                <Link href={`/groups/${group.slug}/chapters`}>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Content
                  </Button>
                </Link>
              )}

            </div>
          </CardHeader>
        </Card>

        {/* Group Status Warning */}
        {group.status === "pending" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                <strong>Pending Approval:</strong> Your group is waiting for
                admin approval. You can manage settings and invite members, but
                content upload will be available after approval.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            
            
            {canManageGroup && (
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
            {canManageGroup && (
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Group Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      {getStatusBadge(group.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Role:</span>
                      <Badge variant="outline">{group.userRole}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canInvite && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  )}

                  {canManageSeries && group.status === "approved" && (
                    <Link href={`/groups/${group.slug}/series`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <BookOpen className="w-4 h-4 mr-2 " />
                        Manage Series
                      </Button>
                    </Link>
                  )}

                  {group.status === "approved" && group.userRole && (
                    <Link href={`/groups/${group.slug}/chapters`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start mt-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Content
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    No recent activity to display.
                  </p>
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

          <TabsContent value="series">
            <Card>
              <CardHeader>
                <CardTitle>Series Management</CardTitle>
                <CardDescription>
                  Create and manage your scanlation series
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-muted-foreground">
                    Manage your groups series here.
                  </p>
                  <Link href={`/groups/${group.slug}/series`}>
                    <Button>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Series
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Upload and manage your scanlation content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Content upload feature coming soon...
                </p>
              </CardContent>
            </Card>
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
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    View your groups performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics feature coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Invite Modal */}
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          groupSlug={group.slug}
        />
      </div>
    </>
  );
}
