// src/components/feed/main/feed.tsx
import { useState } from "react";
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Link } from "../../../components/link";
import Image from "next/image";
import BookmarkButton from "../bookmarked";
import { Badge } from "../../../components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import FeedSkeleton from "./feedSkeleton";

type Manga = {
  publisher: any;
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  chapters: [{
    chapter_number: string;
    published_at: string;
  }];
};

const MangaImage = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={150}
    height={200}
    className="object-cover w-full aspect-2/3"
    loading="lazy"
  />
);

async function fetchMangaData(genre: string, offset: number): Promise<Manga[]> {
  const url = `https://www.${process.env.site_name}.com/api/feed/genre?offset=${offset}&genre=${genre}`;
  // const url = `http://localhost:3000/api/feed/genre?offset=${offset}&genre=${genre}`;
  const res = await fetch(url, {
    next: { revalidate: 100 },
  });
  if (!res.ok) throw new Error('Failed to fetch manga data');
  return res.json();
}

type Props = {
  title: string;
};

async function GenreFeed({ title }: Props) {
  let manga: Manga[] = [];
  let error: Error | null = null;
  
  try {
    manga = await fetchMangaData(title, 0);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error(`Error fetching ${title} manga:`, error);
  }

  if (error) {
    return (
      <div className="py-4">
        <h2 className="text-2xl font-bold mb-4 text-text-900">{title}</h2>
        <p className="text-text-600">Unable to load {title} manga. Please try again later.</p>
      </div>
    );
  }

  if (manga.length < 10) return null;

  return (
    <section>
      <div className="">
        <h2 className="text-2xl font-bold mb-4 text-text-900">
          {title}
        </h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
          <div className="flex w-max space-x-4 p-4">
            {manga.map((serie, index) => (
              <div key={serie.url + index} className="w-[150px] space-y-3">
                <div className="relative overflow-hidden rounded-lg">
                  <Link href={`/series/${serie.url}-${serie.url_code}`} prefetch={true}>
                    <MangaImage src={serie.cover_image_url} alt={serie.title} />
                    {serie.chapters && serie.chapters.length > 0 && 
                      ((serie.chapters[0].published_at.includes("h") ||
                        (serie.chapters[0].published_at.includes("m") && 
                         !serie.chapters[0].published_at.includes("mo"))) && (
                        <Badge className="absolute top-2 right-2 bg-accent-500 text-text-50">
                          Updated
                        </Badge>
                      ))}
                  </Link>
                  <BookmarkButton seriesUrl={serie.url} />
                </div>
                <div className="space-y-2">
                  {serie.chapters && serie.chapters.length > 0 ? (
                    <Link href={`/series/${serie.url}-${serie.url_code}/${serie.publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${serie.chapters[0].chapter_number}`} prefetch={true}>
                      <h3 className="font-semibold text-sm text-text-900 line-clamp-2 space-y-2">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-text-600">
                        <div className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          <span className="truncate">Chapter {serie.chapters[0].chapter_number}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{serie.chapters[0].published_at}</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-sm text-text-900 line-clamp-2 space-y-2">
                      {serie.title}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
        </ScrollArea>
      </div>
    </section>
  );
}

export default function GenreSlider({ title }: Props) {
  return (
    <div className="w-full">
      <GenreFeed title={title} />
    </div>
  );
}