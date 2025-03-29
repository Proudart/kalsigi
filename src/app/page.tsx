// src/app/page.tsx
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Import skeleton components
import DiscoverMangaSkeleton from "../components/feed/main/discoverMangaSkeleton";
import FeedNewSkeleton from "../components/feed/main/feedNewSkeleton";
import FeedSkeleton from "../components/feed/main/feedSkeleton";
import ContinueSkeleton from "../components/feed/continue/continueSkeleton";
import UpdatedSkeleton from "../components/feed/updated/updatedSkeleton";
import RecommendedSkeleton from "../components/feed/recommended/recommendedSkeleton";

// Dynamic imports with suspense
const Continue = dynamic(() => import("../components/feed/continue/continue"), {
  ssr: true,
});
const Recommended = dynamic(
  () => import("../components/feed/recommended/recommended"),
  { ssr: true }
);
const Updated = dynamic(() => import("../components/feed/updated/updated"), {
  ssr: true,
});
const FeedNew = dynamic(() => import("../components/feed/main/feedNew"), {
  ssr: true,
});
const DiscoverManga = dynamic(() => import("../components/feed/main/discoverManga"), {
  ssr: true,
});
const Feed = dynamic(() => import("../components/feed/main/feed"), {
  ssr: true,
});

export default function Home() {
  return (
    <div className="space-y-12 grow container mx-auto px-4 py-8">
      <Suspense fallback={<DiscoverMangaSkeleton />}>
        <DiscoverManga />
      </Suspense>

      <Suspense fallback={<UpdatedSkeleton />}>
        <Updated />
      </Suspense>

      <Suspense fallback={<ContinueSkeleton />}>
        <Continue />
      </Suspense>

      <Suspense fallback={<RecommendedSkeleton />}>
        <Recommended />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={<FeedNewSkeleton title="Latest Updates" />}>
          <FeedNew title="Latest Updates" />
        </Suspense>
        
        <Suspense fallback={<FeedNewSkeleton title="Trending" />}>
          <FeedNew title="Trending" />
        </Suspense>
      </div>

      <div className="space-y-12 mx-auto pb-8"> 
        {/* Using a list of genres to map through and create Feed components */}
        {[
          "Fantasy", "Webtoons", "Action", "Adventure", "Shounen", 
          "Drama", "Seinen", "Martial Arts", "Supernatural", "Romance", 
          "Comedy", "Harem", "School Life", "Mature", "Historical", 
          "Shoujo", "Slice of Life", "Psychological", "Josei", "Adult", 
          "Sci-fi", "Shounen Ai", "Sports", "Tragedy", "Doujinshi", 
          "Horror", "Mystery", "Shoujo Ai", "One Shot", "Yaoi", 
          "Gender Bender", "Ecchi", "Mecha"
        ].map((genre) => (
          <Suspense key={genre} fallback={<FeedSkeleton title={genre} />}>
            <Feed title={genre} />
          </Suspense>
        ))}
      </div>
    </div>
  );
}