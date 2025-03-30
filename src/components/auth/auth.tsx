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
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/drop-down-menu";

import SignOut from "../auth/logout";
import { useState, useEffect } from "react";
import { setCookie, deleteCookie } from "cookies-next";

interface User {
  username: null | undefined;
  name: string;
}

import { createAuthClient } from "better-auth/react";
import { useCallback, useMemo } from "react";
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://www.manhwacall.com'
  : 'http://localhost:3000';
const { useSession } = createAuthClient({baseURL: baseURL});


export default function Auth() {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        setUser(null);
        deleteCookie("adFree");
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
      deleteCookie("adFree");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const disabled = useMemo(() => isPending || isLoading, [isPending, isLoading]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const MemoizedIconLoader2 = useMemo(() => <IconLoader2 className="animate-spin" />, []);
  
  const MemoizedIconUser = useMemo(() => <IconUser />, []);

  const UserMenu = useMemo(() => (
    <DropdownMenuContent className="w-56 bg-accent-200">
      <DropdownMenuItem>
        <Link
          prefetch={true}
          href="/profile"
          className="flex items-center space-x-2 bg-accent-400 text-accent-900 px-2 py-1 rounded-full"
        >
          <IconUser className="w-4 h-4" />
          <span>{user as any}</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          href="/messages"
          className="flex items-center space-x-2"
          prefetch={true}
        >
          <IconMail className="w-4 h-4" />
          <span>Messages</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          href="/settings"
          className="flex items-center space-x-2"
          prefetch={true}
        >
          <IconSettings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <div className="flex items-center space-x-2">
          <IconLogout className="w-4 h-4" />
          <SignOut />
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  ), [user]);

  const AuthMenu = useMemo(() => (
    <DropdownMenuContent className="w-56 bg-accent-200" align="end">
      <DropdownMenuItem>
        <Link
          href="/signup"
          className="flex items-center space-x-2"
          prefetch={true}
        >
          <IconUserPlus className="w-4 h-4" />
          <span>Sign Up</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          href="/signin"
          className="flex items-center space-x-2"
          prefetch={true}
        >
          <IconLogin className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  ), []);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center space-x-1 px-2 py-2 bg-blue-500 text-white rounded-lg ml-2 relative"
          onClick={getUser}
          disabled={disabled}
        >
          {isPending || isLoading ? (
            MemoizedIconLoader2
          ) : (
            MemoizedIconUser
          )}
        </DropdownMenuTrigger>
        {isPending || isLoading ? (
          <DropdownMenuContent className="w-56 bg-accent-200">
            <DropdownMenuItem className="flex justify-center">
              {MemoizedIconLoader2}
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : user ? (
          UserMenu
        ) : (
          AuthMenu
        )}
      </DropdownMenu>
    </div>
  );
}