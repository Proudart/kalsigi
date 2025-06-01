'use client';
import { useState, useEffect } from 'react';
import { Link } from '@//components/link';
import { Button } from '@//components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/drop-down-menu';
import { Badge } from '@//components/ui/badge';
import { Users, Plus, Settings, Upload, ChevronDown } from 'lucide-react';
import { createAuthClient } from "better-auth/react";


// Auth setup from the first component
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://www.manhwacall.com'
  : 'http://localhost:3000';
const { useSession } = createAuthClient({ baseURL: baseURL });

interface UserGroup {
  group: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  role: string;
}

export function GroupsNavigation() {
  // Use the auth session from better-auth
  const { data: session, isPending } = useSession();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user from session instead of undefined variable
  const user = session?.user;

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    } else {
      // Reset loading state if no user
      setLoading(false);
    }
  }, [user]);

  const fetchUserGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const groups = await response.json();
        setUserGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if session is still loading or user is not authenticated
  if (isPending || !user) return null;

  return (
    <div className='bg-background-200'>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Groups</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background-200">
        <div className="px-2 py-1.5 text-sm font-semibold ">Your Groups</div>
       
        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : userGroups.length > 0 ? (
          userGroups.map(({ group, role }) => (
            <DropdownMenuItem key={group.id} asChild>
              <Link href={`/groups/${group.slug}`} className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{role}</span>
                </div>
                <Badge
                  variant={group.status === 'approved' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {group.status}
                </Badge>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No groups yet</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
       
        <DropdownMenuItem asChild>
          <Link href="/groups/create" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Link>
        </DropdownMenuItem>
       
        <DropdownMenuItem asChild>
          <Link href="/groups" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Browse Groups
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/groups/invites" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Group Invites
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}