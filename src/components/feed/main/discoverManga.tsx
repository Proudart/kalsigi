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
      className="object-cover w-full aspect-[2/3]"
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
    const response = await fetch(
      `/api/feed/discoverManga?search=${searchTerm}&genre=${genre}`
    );
    if (response.ok) {
      const data = await response.json();
      setResults(data);
    } else {
      console.error("Error fetching manga data");
    }
    setIsLoading(false);
  };

  return (
    <section className="mt-8 bg-background-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-text-900">Discover Manga</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex flex-grow">
          <Input
            type="text"
            placeholder="Search manga..."
            className="flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md pl-1" 
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
      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
        <div className="flex w-max space-x-4 p-4">
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="w-[150px] space-y-3">
                    <div className="relative">
                      <Skeleton className="w-[150px] h-[200px]" />
                    </div>
                    <Skeleton className="h-[33px] w-full" />
                  </div>
                ))
            : results.map((manga, index) => (
                <div key={manga.url + index} className="w-[150px] space-y-3">
                  <div className="relative">
                    {/* Image wrapped in Link */}
                    <Link
                      href={`/series/${manga.url}-${manga.url_code}`}
                      prefetch={true}
                    >
                      <SeriesImage
                        src={manga.cover_image_url}
                        alt={manga.title}
                        width={150}
                        height={200}
                      />
                    </Link>
                    {/* BookmarkButton outside of Link */}
                    <BookmarkButton seriesUrl={manga.url} />
                  </div>
                  {/* Title in separate Link */}
                  <Link
                    href={`/series/${manga.url}-${manga.url_code}`}
                    prefetch={true}
                  >
                    <h3 className="font-semibold text-sm text-text-900 line-clamp-2 space-y-2">
                      {manga.title}
                    </h3>
                  </Link>
                </div>
              ))}
        </div>
        <ScrollBar
          orientation="horizontal"
          className="bg-primary-100 hover:bg-primary-200"
        />
      </ScrollArea>
    </section>
  );
};

export default DiscoverManga;