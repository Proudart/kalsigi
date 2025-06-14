"use client";

import Link from "next/link";
import {
  IconUser,
  IconMail,
  IconSettings,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconLoader2,
  Users,
  Plus,
  Crown,
  Shield,
  Settings
} from '@/lib/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/drop-down-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import SignOut from "../auth/logout";
import { useState, useEffect } from "react";
import { setCookie, deleteCookie } from "cookies-next";

interface User {
  username: null | undefined;
  name: string;
  role?: string; // Add role property as optional
}

interface UserGroup {
  group: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  role: string;
}

import { createAuthClient } from "better-auth/react";
import { useCallback, useMemo } from "react";
import { getAuthUrls } from "../../lib/utils";

const { baseURL } = getAuthUrls();
type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: string; // Add role as optional
};

interface Session {
  user: SessionUser;
  [key: string]: any;
}

const { useSession }: { useSession: () => { data: Session | null, isPending: boolean } } = createAuthClient({ baseURL });


export default function Auth() {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const fetchUserGroups = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setGroupsLoading(true);
      const response = await fetch('/api/groups');
      if (response.ok) {
        const groups = await response.json();
        setUserGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  }, [session?.user]);

  const getUser = useCallback(async () => {
    try {
      setIsLoading(true);
      if (session) {
        const username = await fetch("/api/auth/username");
        const usernameData = await username.json();
        const adFreeData = usernameData.isPremium;
        setUser(session.user.name as any);
        
        if (adFreeData) {
          setCookie("adFree", adFreeData, { maxAge: 60 * 60 * 24 });
        } else {
          deleteCookie("adFree");
        }

        await Promise.all([
          fetch("/api/auth/syncBookmarks", { method: "POST" }),
          fetch("/api/auth/syncSeriesHistory", { method: "POST" }),
        ]);

        // Fetch user groups after successful auth
        fetchUserGroups();
      } else {
        setUser(null);
        setUserGroups([]);
        deleteCookie("adFree");
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
      setUserGroups([]);
      deleteCookie("adFree");
    } finally {
      setIsLoading(false);
    }
  }, [session, fetchUserGroups]);

  const disabled = useMemo(() => isPending || isLoading, [isPending, isLoading]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const getRoleIcon = (role: string) => {
    const icons = {
      owner: Crown,
      'co-owner': Shield,
      moderator: Shield,
    };
    return icons[role as keyof typeof icons] || Users;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'text-purple-600',
      'co-owner': 'text-blue-600',
      moderator: 'text-emerald-600',
    };
    return colors[role as keyof typeof colors] || 'text-text-600';
  };

  const MemoizedIconLoader2 = useMemo(() => (
    <IconLoader2 className="w-4 h-4 animate-spin" />
  ), []);
  
  const UserAvatar = useMemo(() => (
    <Avatar className="w-8 h-8 border-2 border-primary-200">
      <AvatarImage src={session?.user?.image || ''} alt={user as unknown as string} />
      <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium ">
        {((user as unknown as string) || 'U').charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ), [user, session?.user?.image]);

  const UserMenu = useMemo(() => (
    <DropdownMenuContent className="w-64 bg-background-100 border-background-200 shadow-lg" align="end">
      {/* User Info Header */}
      <div className="px-3 py-2 border-b border-background-200">
        <div className="flex items-center space-x-3">
          {UserAvatar}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-900 truncate">{user as unknown as string}</p>
            <p className="text-xs text-text-600">Logged in</p>
          </div>
        </div>
      </div>

      {/* Profile & Settings */}
      <div className="py-1">
        <DropdownMenuItem asChild>
          <Link
            prefetch={true}
            href="/profile"
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          >
            <IconUser className="w-4 h-4 text-text-600" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/messages"
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
            prefetch={true}
          >
            <IconMail className="w-4 h-4 text-text-600" />
            <span>Messages</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
            prefetch={true}
          >
            <IconSettings className="w-4 h-4 text-text-600" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
      </div>
      
      <DropdownMenuSeparator className="bg-background-200" />
      
      {/* Groups Section */}
      <div className="py-1">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-700 uppercase tracking-wide">
              Your Groups
            </span>
            {userGroups.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {userGroups.length}
              </Badge>
            )}
          </div>
        </div>
        
        {groupsLoading ? (
          <DropdownMenuItem disabled className="px-3 py-2 text-sm">
            <IconLoader2 className="w-4 h-4 animate-spin mr-2" />
            Loading groups...
          </DropdownMenuItem>
        ) : userGroups.length > 0 ? (
          <div className="max-h-32 overflow-y-auto">
            {userGroups.map(({ group, role }) => {
              const RoleIcon = getRoleIcon(role);
              const roleColor = getRoleColor(role);
              
              return (
                <DropdownMenuItem key={group.id} asChild>
                  <Link 
                    href={`/groups/${group.slug}`} 
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <RoleIcon className={`w-4 h-4 ${roleColor} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-900 truncate">{group.name}</p>
                        <p className="text-xs text-text-600 capitalize">{role.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <Badge
                      variant={group.status === 'approved' ? 'default' : 'secondary'}
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {group.status === 'approved' ? 'Active' : 'Pending'}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        ) : (
          <DropdownMenuItem disabled className="px-3 py-2 text-sm text-text-500">
            No groups yet
          </DropdownMenuItem>
        )}
      </div>
      
      <DropdownMenuSeparator className="bg-background-200" />
      
      {/* Admin Section - Only show for admin users */}
      {session?.user?.role === 'admin' && (
        <>
          <div className="py-1">
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-text-700 uppercase tracking-wide">
                Admin Panel
              </span>
            </div>
            <DropdownMenuItem asChild>
              <Link 
                href="/admin" 
                className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="bg-background-200" />
        </>
      )}
      
      {/* Group Actions */}
      <div className="py-1">
        <DropdownMenuItem asChild>
          <Link 
            href="/groups/create" 
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-text-600" />
            <span>Create Group</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            href="/groups" 
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          >
            <Users className="w-4 h-4 text-text-600" />
            <span>Browse Groups</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            href="/groups/invites" 
            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          >
            <IconMail className="w-4 h-4 text-text-600" />
            <span>Group Invites</span>
          </Link>
        </DropdownMenuItem>
      </div>
      
      <DropdownMenuSeparator className="bg-background-200" />
      
      {/* Logout */}
      <div className="py-1">
        <DropdownMenuItem className="px-3 py-2 text-sm hover:bg-background-200 cursor-pointer">
          <div className="flex items-center space-x-2 text-red-600">
            <IconLogout className="w-4 h-4" />
            <SignOut />
          </div>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  ), [user, userGroups, groupsLoading, UserAvatar]);

  const AuthMenu = useMemo(() => (
    <DropdownMenuContent className="w-48 bg-background-100 border-background-200 shadow-lg" align="end">
      <DropdownMenuItem asChild>
        <Link
          href="/signup"
          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          prefetch={true}
        >
          <IconUserPlus className="w-4 h-4 text-text-600" />
          <span>Sign Up</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href="/signin"
          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-background-200 cursor-pointer"
          prefetch={true}
        >
          <IconLogin className="w-4 h-4 text-text-600" />
          <span>Sign In</span>
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  ), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full hover:bg-background-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={getUser}
          disabled={disabled}
        >
          {isPending || isLoading ? (
            MemoizedIconLoader2
          ) : user ? (
            UserAvatar
          ) : (
            <IconUser className="w-4 h-4 text-text-600" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      {isPending || isLoading ? (
        <DropdownMenuContent className="w-48 bg-background-100 border-background-200" align="end">
          <DropdownMenuItem disabled className="flex justify-center py-4">
            {MemoizedIconLoader2}
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : user ? (
        UserMenu
      ) : (
        AuthMenu
      )}
    </DropdownMenu>
  );
}