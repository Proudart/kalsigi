import { Suspense } from "react";
import Image from "next/image";
import { Link } from "@//components/link";
import { Users, BookOpen, User, Calendar } from "lucide-react";
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
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
        ? `https://www.${process.env.site_name}.com`
        : 'http://localhost:3000';

    const response = await fetch(
        `${baseUrl}/api/groups/all`,
        {
            next: { revalidate: 3600 }, // Revalidate every hour
        }
    );

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
  return (
    <div className="bg-background-100 border border-background-300 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {group.avatar_url ? (
            <Image
              src={group.avatar_url}
              alt={group.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <div>
            <Link href={`/groups/${group.name}`} prefetch={true}>
              <h3 className="text-xl font-bold text-text-900 hover:text-primary-600 transition-colors">
                {group.name}
              </h3>
            </Link>
            <div className="flex items-center text-sm text-text-600 mt-1">
              <User className="w-4 h-4 mr-1" />
              <span>Owned by {group.owner}</span>
            </div>
          </div>
        </div>
        {group.chapters_published > 100 && (
          <Badge className="bg-accent-500 text-text-50">Active</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-background-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-primary-600 mb-1">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-900">
            {group.member_count}
          </p>
          <p className="text-xs text-text-600">Members</p>
        </div>

        <div className="bg-background-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-primary-600 mb-1">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-900">
            {group.chapters_published}
          </p>
          <p className="text-xs text-text-600">Chapters</p>
        </div>

        <div className="bg-background-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-primary-600 mb-1">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-text-900">
            {formatDate(group.created_at)}
          </p>
          <p className="text-xs text-text-600">Created</p>
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
            className="bg-background-100 border border-background-300 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-text-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-700">No groups found</h3>
        <p className="text-text-600 mt-2">Check back later for new groups!</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-900 mb-2">
          Scanlation Groups
        </h1>
        <p className="text-text-600">
          Discover the groups bringing you the latest manga translations
        </p>
      </div>

      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsContent />
      </Suspense>
    </div>
  );
}