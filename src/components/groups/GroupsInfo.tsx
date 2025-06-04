import { Suspense } from "react";
import Image from "next/image";
import { Link } from "@//components/link";
import {
  Users,
  BookOpen,
  User,
  Calendar,
  TrendingUp,
  Star,
} from "lucide-react";
import { Badge } from "@//components/ui/badge";
import { ScrollArea } from "@//components/ui/scroll-area";
import { Skeleton } from "@//components/ui/skeleton";

interface Group {
  id: string;
  name: string;
  url: string;
  owner: string;
  member_count: number;
  chapters_published: number;
  created_at: string;
  avatar_url?: string;
}

async function fetchGroups(): Promise<Group[]> {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = isProduction
      ? `https://www.${process.env.site_name}.com`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/groups/all`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function GroupCard({ group }: { group: Group }) {
  const isActiveGroup = group.chapters_published > 100;
  const isNewGroup =
    new Date(group.created_at) >
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="group relative bg-background-600 border border-background-400 rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              {group.avatar_url ? (
                <Image
                  src={group.avatar_url}
                  alt={group.name}
                  width={72}
                  height={72}
                  className="rounded-full object-cover border-2 border-primary-200 group-hover:border-primary-400 transition-colors"
                />
              ) : (
                <div className="w-18 h-18 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full flex items-center justify-center border-2 border-primary-200 group-hover:border-primary-400 transition-colors">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              )}
              {isActiveGroup && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/groups/${group.name}`} prefetch={true}>
                <h3 className="text-xl font-bold text-text-200  transition-colors truncate ">
                  {group.name}
                </h3>
              </Link>
              <div className="flex items-center text-sm text-text-100 mt-1">
                <User className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">Owned by {group.owner}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {isActiveGroup && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium px-2 py-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {isNewGroup && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-2 py-1">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background-500 rounded-lg p-4 text-center border border-primary-200 group-hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center text-primary-200 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-primary-200">
              {group.member_count}
            </p>
            <p className="text-xs text-primary-200 font-medium">Members</p>
          </div>

          <div className="bg-background-500 rounded-lg p-4 text-center border border-secondary-200 group-hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center text-primary-200 mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-primary-200">
              {group.chapters_published}
            </p>
            <p className="text-xs text-primary-200 font-medium">Chapters</p>
          </div>

          <div className="bg-background-500 rounded-lg p-4 text-center border border-accent-200 group-hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center text-primary-200 mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-primary-200">
              {formatDate(group.created_at)}
            </p>
            <p className="text-xs text-primary-200 font-medium">Created</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="bg-background-100 border border-background-300 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-18 h-18 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}

async function GroupsContent() {
  const groups = await fetchGroups();

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-text-700 mb-2">
          No groups found
        </h3>
        <p className="text-text-600 max-w-md mx-auto">
          Be the first to create a scanlation group and start building your
          community!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 ">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <Users className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-900 mb-4">
            Scanlation Groups
          </h1>
          <p className="text-lg sm:text-xl text-text-600 max-w-2xl mx-auto">
            Discover the passionate teams bringing you the latest manga
            translations from around the world
          </p>
        </div>
        {/* Create Group CTA */}
        <div className="mb-8 text-center">
          <Link
            href="/groups/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Create Your Own Scanlation Group
          </Link>
        </div>

        {/* Groups Grid */}
        <Suspense fallback={<GroupsSkeleton />}>
          <GroupsContent />
        </Suspense>
      </div>
    </div>
  );
}
