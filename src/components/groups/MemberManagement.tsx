"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@//components/ui/card";
import { Badge } from "@//components/ui/badge";
import { Button } from "@//components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@//components/ui/select";
import { Avatar, AvatarFallback } from "@//components/ui/avatar";
import {
  MoreHorizontal,
  UserMinus,
  Crown,
  Shield,
  Users,
  Upload,
  Eye,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@//components/ui/drop-down-menu";
import { useToast } from "@//components/ui/use-toast";

interface Member {
  role: string;
  joinedAt: string;
  status: string;
  name: string;
}

interface MemberManagementProps {
  groupSlug: string;
  userRole: string;
}

export function MemberManagement({
  groupSlug,
  userRole,
}: MemberManagementProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const canManageMembers = ["owner", "co-owner", "moderator"].includes(
    userRole
  );
  const canRemoveMembers = ["owner", "co-owner"].includes(userRole);

  useEffect(() => {
    fetchMembers();
  }, [groupSlug]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(
        `/api/groups/${groupSlug}/members/${memberId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast({ title: "Member role updated successfully" });
        fetchMembers();
      } else {
        throw new Error("Failed to update member role");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `/api/groups/${groupSlug}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({ title: "Member removed successfully" });
        fetchMembers();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      owner: {
        icon: Crown,
        color: "bg-purple-100 text-purple-800 border-purple-200",
        bgColor: "bg-purple-50",
      },
      "co-owner": {
        icon: Shield,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        bgColor: "bg-blue-50",
      },
      moderator: {
        icon: Shield,
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        bgColor: "bg-emerald-50",
      },
      qa: {
        icon: Eye,
        color: "bg-orange-100 text-orange-800 border-orange-200",
        bgColor: "bg-orange-50",
      },
      uploader: {
        icon: Upload,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        bgColor: "bg-gray-50",
      },
      member: {
        icon: Users,
        color: "bg-gray-100 text-gray-600 border-gray-200",
        bgColor: "bg-gray-50",
      },
    };
    return configs[role as keyof typeof configs] || configs.member;
  };

  if (loading) {
    return (
      <Card className="bg-background-600 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-600">Loading members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-600 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Group Members</span>
            <Badge variant="secondary" className="ml-2">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-700 mb-2">
              No members found
            </h3>
            <p className="text-text-600">
              Start inviting members to build your scanlation team!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member, index) => {
              const roleConfig = getRoleConfig(member.role);
              const RoleIcon = roleConfig.icon;

              return (
                <div
                  key={`${member.name}-${index}`}
                  className={`relative overflow-hidden rounded-lg border border-background-300 hover:shadow-md transition-all duration-200`}
                >
                  <div className="p-4 sm:p-6 clas">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Member Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-background-200">
                          <AvatarFallback className="bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-700 font-semibold text-lg">
                            {member.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-text-900 truncate">
                              {member.name || "Unknown User"}
                            </h3>
                            <RoleIcon className="w-4 h-4 text-text-500 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1 text-sm text-text-600">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Joined{" "}
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Role Badge and Actions */}
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${roleConfig.color} text-sm font-medium px-3 py-1 border`}
                        >
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role.replace("-", " ")}
                        </Badge>

                        {canManageMembers && member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-background-200"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-accent-100">
                              <DropdownMenuItem
                                onClick={() => {
                                  /* Show role change dialog */
                                }}
                                className="flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Change Role
                              </DropdownMenuItem>
                              {canRemoveMembers && (
                                <DropdownMenuItem
                                  onClick={() => removeMember(member.name)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2"
                                >
                                  <UserMinus className="w-4 h-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
