import { Suspense } from "react";
import Image from "next/image";
import { Link } from "@//components/link";
import { Users, BookOpen, User, Calendar, TrendingUp, Star } from "lucide-react";
import { Badge } from "@//components/ui/badge";
import { Skeleton } from "@//components/ui/skeleton";
import { getBaseUrl } from "@//lib/utils";

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
    const response = await fetch(`${getBaseUrl()}/api/groups/all`, {
      next: { revalidate: 3600 },
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
    <div className="group relative bg-background-100 border border-background-200 rounded-lg p-4 md:p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300">
      {/* Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              {group.avatar_url ? (
                <Image
                  src={group.avatar_url}
                  alt={group.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full flex items-center justify-center border-2 border-primary-200">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              )}
              {isActiveGroup && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/groups/${group.name}`} prefetch={true}>
                <h3 className="text-lg font-bold text-text-800 hover:text-primary-600 transition-colors truncate">
                  {group.name}
                </h3>
              </Link>
              <div className="flex items-center text-sm text-text-600 mt-1">
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">by {group.owner}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end ml-2">
            {isActiveGroup && (
              <Badge className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {isNewGroup && (
              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-primary-600 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-text-800">{group.member_count}</p>
            <p className="text-xs text-text-600">Members</p>
          </div>

          <div className="bg-background-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-secondary-600 mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-text-800">{group.chapters_published}</p>
            <p className="text-xs text-text-600">Chapters</p>
          </div>

          <div className="bg-background-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center text-accent-600 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-text-800">{formatDate(group.created_at)}</p>
            <p className="text-xs text-text-600">Created</p>
          </div>
        </div>
      </div>
      </div>

  );
}




async function GroupsContent() {
  const groups = await fetchGroups();

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-text-700 mb-2">
          No groups found
        </h3>
        <p className="text-text-600">
          Be the first to create a scanlation group!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <div className="min-h-screen s py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-900 mb-2">
            Scanlation Groups
          </h1>
          <p className="text-text-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover passionate teams bringing you the latest manga translations
          </p>
        </div>

        {/* Create Group CTA */}
        <div className="mb-8 text-center">
          <Link
            href="/groups/create"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Users className="w-5 h-5" />
            Create Your Group
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

function GroupsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="bg-background-100 border border-background-200 rounded-lg p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
