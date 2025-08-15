// src/components/feed/main/discoverManga.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Link } from "../../../components/link";
import { ScrollBar } from "../../../components/ui/scroll-area";
import { ScrollArea } from "../../../components/ui/scroll-area";
import Image from "next/image";
import { Skeleton } from "../../../components/ui/skeleton";
import BookmarkButton from "../bookmarked";

const SeriesImage = ({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="object-cover w-full aspect-2/3"
      loading="lazy"
    />
  );
};

interface MangaResult {
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
}

// Skeleton component for manga items
const MangaSkeleton = () => (
  <>
    {Array(6).fill(0).map((_, index) => (
      <div key={index} className="w-[150px] space-y-3">
        <div className="relative">
          <Skeleton className="w-[150px] h-[200px] rounded-md" />
          <Skeleton className="absolute top-2 left-2 w-8 h-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ))}
  </>
);

const DiscoverManga: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [results, setResults] = useState<MangaResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManga();
  }, []);

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      fetchManga();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm, genre]);

  const fetchManga = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/feed/discoverManga?search=${searchTerm}&genre=${genre}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error("Error fetching manga data");
      }
    } catch (error) {
      console.error("Failed to fetch manga:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Discover Manga
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Find your next favorite series from our extensive collection
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search manga..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-gray-900 dark:text-white transition-colors duration-200"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Adult">Adult</option>
          <option value="Adventure">Adventure</option>
          <option value="Comedy">Comedy</option>
          <option value="Doujinshi">Doujinshi</option>
          <option value="Drama">Drama</option>
          <option value="Ecchi">Ecchi</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Gender Bender">Gender Bender</option>
          <option value="Harem">Harem</option>
          <option value="Historical">Historical</option>
          <option value="Horror">Horror</option>
          <option value="Josei">Josei</option>
          <option value="Martial Arts">Martial Arts</option>
          <option value="Mature">Mature</option>
          <option value="Mecha">Mecha</option>
          <option value="Mystery">Mystery</option>
          <option value="One Shot">One Shot</option>
          <option value="Psychological">Psychological</option>
          <option value="Romance">Romance</option>
          <option value="School Life">School Life</option>
          <option value="Sci-fi">Sci-fi</option>
          <option value="Seinen">Seinen</option>
          <option value="Shoujo">Shoujo</option>
          <option value="Shoujo Ai">Shoujo Ai</option>
          <option value="Shounen">Shounen</option>
          <option value="Shounen Ai">Shounen Ai</option>
          <option value="Slice of Life">Slice of Life</option>
          <option value="Sports">Sports</option>
          <option value="Supernatural">Supernatural</option>
          <option value="Tragedy">Tragedy</option>
          <option value="Webtoons">Webtoons</option>
          <option value="Yaoi">Yaoi</option>
        </select>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 pb-4">
          {isLoading ? (
            <MangaSkeleton />
          ) : results.length > 0 ? (
            results.map((manga, index) => (
              <div key={manga.url + index} className="w-[160px] md:w-[180px] group">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <Link
                      href={`/series/${manga.url}-${manga.url_code}`}
                      prefetch={true}
                    >
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <SeriesImage
                          src={manga.cover_image_url}
                          alt={manga.title}
                          width={180}
                          height={240}
                        />
                      </div>
                    </Link>
                    <BookmarkButton seriesUrl={manga.url} />
                  </div>
                  <Link
                    href={`/series/${manga.url}-${manga.url_code}`}
                    prefetch={true}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {manga.title}
                    </h3>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-16 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">No manga found. Try another search.</p>
              </div>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </section>
  );
};

export default DiscoverManga;