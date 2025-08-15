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

export default function Home() {
  return (
    <div className="min-h-screen bg-background-100">
      <div className="w-full px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section - Discover Manga */}
          <div className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
            <Suspense fallback={<DiscoverMangaSkeleton />}>
              <DiscoverManga />
            </Suspense>
          </div>

          {/* Continue Reading Section */}
          <Suspense fallback={<ContinueSkeleton />}>
            <Continue />
          </Suspense>

          {/* Featured Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Updated Series */}
            <div className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
              <Suspense fallback={<UpdatedSkeleton />}>
                <Updated />
              </Suspense>
            </div>

            {/* Recommended Series */}
            <div className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
              <Suspense fallback={<RecommendedSkeleton />}>
                <Recommended />
              </Suspense>
            </div>
          </div>

          {/* Latest & Trending Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
              <Suspense fallback={<FeedNewSkeleton title="Latest Updates" />}>
                <FeedNew title="Latest Updates" />
              </Suspense>
            </div>
            
            <div className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
              <Suspense fallback={<FeedNewSkeleton title="Trending" />}>
                <FeedNew title="Trending" />
              </Suspense>
            </div>
          </div>

          {/* Genre Sections */}
          <div className="space-y-8">
            {[
              "Fantasy", "Webtoons", "Action", "Adventure", "Shounen", 
              "Drama", "Seinen", "Martial Arts", "Supernatural", "Romance", 
              "Comedy", "Harem", "School Life", "Mature", "Historical", 
              "Shoujo", "Slice of Life", "Psychological", "Josei", "Adult", 
              "Sci-fi", "Shounen Ai", "Sports", "Tragedy", "Doujinshi", 
              "Horror", "Mystery", "Shoujo Ai", "One Shot", "Yaoi", 
              "Gender Bender", "Ecchi", "Mecha"
            ].map((genre) => (
              <div key={genre} className="bg-background-800 rounded-xl shadow-lg border border-background-700 p-6">
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