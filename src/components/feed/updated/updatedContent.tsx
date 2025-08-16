"use client";

import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Link } from "../../../components/link";
import Image from "next/image";
import BookmarkButton from "../bookmarked";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

interface Chapter {
  publisher: any;
  chapter_number: string | number;
  updated_at: string;
}

interface Manga {
  publisher: any;
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  updated_at: string;
  chapters: Chapter[];
}

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
}) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className="w-full h-[200px] object-cover rounded-md aspect-2/3"
    loading="lazy"
    blurDataURL={`${src}&w=16&q=1`}
  />
);
function formatDistanceToNow(date: Date) {
  const diff = Date.now() - date.getTime();
  const years = Math.floor(diff / 31536000000);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let result = "now";
  if (years > 0) result = `${years}yr`;
  else if (months > 0) result = `${months}mo`;
  else if (days > 0) result = `${days}d`;
  else if (hours > 0) result = `${hours}h`;
  else if (minutes > 0) result = `${minutes}m`;

  return result;
}

function ContinueContent({ data }: { data: Manga[] }) {
  const validManga = data.filter(
    (manga) =>
      manga &&
      manga.url &&
      manga.url_code &&
      manga.cover_image_url &&
      manga.title &&
      manga.chapters?.length > 0
  );

  if (validManga.length === 0) return null;

  return (
    <section className="space-y-6" data-testid="just-updated">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-900 tracking-tight">
          Just Updated
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-200 text-text-900" data-testid="updated-badge">
          {data.length} series
        </span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap bg-background-500 rounded-lg border p-4">
        <div className="flex w-max space-x-4">
          {data.map((serie, index) => (
            <div key={serie.url + index} className="w-[160px] md:w-[180px] group">
              <div className="bg-background-100 rounded-lg p-3 hover:bg-background-300 transition-colors duration-200 border">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <Link
                    href={`/series/${serie.url}-${serie.url_code}`}
                    prefetch={true}
                  >
                    <div className="aspect-[3/4] bg-background-300 rounded-lg overflow-hidden">
                      <SeriesImage
                        src={serie.cover_image_url}
                        alt={serie.title}
                        width={180}
                        height={240}
                      />
                    </div>
                    {new Date().getTime() -
                      new Date(serie.updated_at).getTime() <
                      24 * 60 * 60 * 1000 && (
                      <div className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-200 text-text-900">
                        Updated
                      </div>
                    )}
                  </Link>
                  <BookmarkButton seriesUrl={serie.url} />
                </div>
                
                <div className="space-y-2">
                  <Link
                    href={`/series/${serie.url}-${serie.url_code}/${serie.chapters[0].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${serie.chapters[0].chapter_number}`}
                    prefetch={true}
                  >
                    <h3 className="text-sm font-semibold text-text-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                      {serie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span className="truncate">
                          Ch. {serie.chapters[0].chapter_number}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {formatDistanceToNow(
                            new Date(serie.chapters[0].updated_at)
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </section>
  );
}

export default ContinueContent;
