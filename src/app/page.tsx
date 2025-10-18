// src/app/page.tsx
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { lazyHydrate } from 'next-lazy-hydration-on-scroll';
// Import skeleton components
import DiscoverMangaSkeleton from "../components/feed/main/discoverMangaSkeleton";
import FeedNewSkeleton from "../components/feed/main/feedNewSkeleton";
import FeedSkeleton from "../components/feed/main/feedSkeleton";
import ContinueSkeleton from "../components/feed/continue/continueSkeleton";
import UpdatedSkeleton from "../components/feed/updated/updatedSkeleton";
import RecommendedSkeleton from "../components/feed/recommended/recommendedSkeleton";

// Lazy hydrated components
const Continue = lazyHydrate(() => import("../components/feed/continue/continue"), {
  LoadingComponent: ContinueSkeleton,
  wrapperElement: 'section'
});

const Recommended = lazyHydrate(
  () => import("../components/feed/recommended/recommended"),
  { 
    LoadingComponent: RecommendedSkeleton,
    wrapperElement: 'section'
  }
);

const Updated = lazyHydrate(() => import("../components/feed/updated/updated"), {
  LoadingComponent: UpdatedSkeleton,
  wrapperElement: 'section'
});

const FeedNew = dynamic(() => import("../components/feed/main/feedNew"), {
  loading: () => <FeedNewSkeleton />,
  ssr: true
});

const DiscoverManga = lazyHydrate(() => import("../components/feed/main/discoverManga"), {
  LoadingComponent: DiscoverMangaSkeleton,
  wrapperElement: 'section'
});

const Feed = dynamic(() => import("../components/feed/main/feed"), {
  loading: () => <FeedSkeleton />,
  ssr: true
});

const FeaturedGrid = dynamic(() => import("../components/feed/FeaturedGrid"), {
  ssr: true
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background-100">
      <div className="w-full px-3 sm:px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Hero Section - Discover Manga */}
          <div className="bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
            <Suspense fallback={<DiscoverMangaSkeleton />}>
              <DiscoverManga />
            </Suspense>
          </div>

          {/* Continue Reading Section */}
          <Suspense fallback={<ContinueSkeleton />}>
            <Continue />
          </Suspense>

          {/* Featured Content Grid */}
            <div className="">
            <FeaturedGrid />
            </div>

          {/* Latest & Trending Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
              <Suspense fallback={<FeedNewSkeleton title="Latest Updates" />}>
                <FeedNew title="Latest Updates" />
              </Suspense>
            </div>
            
            <div className="bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
              <Suspense fallback={<FeedNewSkeleton title="Trending" />}>
                <FeedNew title="Trending" />
              </Suspense>
            </div>
          </div>

          {/* Popular Genre Sections - Limited to avoid performance issues */}
          <div className="space-y-6 sm:space-y-8">
            {[
              "Fantasy", "Action", "Romance", "Drama", "Comedy"
            ].map((genre) => (
              <div key={genre} className="bg-primary-100 rounded-lg shadow-md p-4 sm:p-6">
                <Suspense fallback={<FeedSkeleton title={genre} />}>
                  <Feed title={genre} />
                </Suspense>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}