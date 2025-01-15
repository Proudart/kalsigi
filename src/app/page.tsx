import React from "react";
import dynamic from "next/dynamic";

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
    <div className="space-y-12 flex-grow container mx-auto px-4 py-8">
      <DiscoverManga />
      <Updated />
      <Continue />
      <Recommended />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FeedNew title="Latest Updates" />
        <FeedNew title="Trending" />
      </div>

      <div className="space-y-12  mx-auto  pb-8"> 
        <Feed title="Fantasy" />
        <Feed title="Webtoons" />
        <Feed title="Action" />
        <Feed title="Adventure" />
        <Feed title="Shounen" />
        <Feed title="Drama" />
        <Feed title="Seinen" />
        <Feed title="Martial Arts" />
        <Feed title="Supernatural" />
        <Feed title="Romance" />
        <Feed title="Comedy" />
        <Feed title="Harem" />
        <Feed title="School Life" />
        <Feed title="Mature" />
        <Feed title="Historical" />
        <Feed title="Shoujo" />
        <Feed title="Slice of Life" />
        <Feed title="Psychological" />
        <Feed title="Josei" />
        <Feed title="Adult" />
        <Feed title="Sci-fi" />
        <Feed title="Shounen Ai" />
        <Feed title="Sports" />
        <Feed title="Tragedy" />
        <Feed title="Doujinshi" />
        <Feed title="Horror" />
        <Feed title="Mystery" />
        <Feed title="Shoujo Ai" />
        <Feed title="One Shot" />
        <Feed title="Yaoi" />
        <Feed title="Gender Bender" />
        <Feed title="Ecchi" />
        <Feed title="Mecha" />
      </div>
    </div>
  );
}

