"use client";

import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Link } from "../../../components/link";
import Image from "next/image";
import BookmarkButton from "../bookmarked";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

interface Chapter {
  chapter_number: string | number;
  updated_at: string;
}

interface Manga {
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
    <div>
      <section>
        <h2 className="text-2xl font-bold mb-4">Just Updated</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
          <div className="flex w-max space-x-4 p-4">
            {data.map((serie, index) => (
              <div key={serie.url + index} className="w-[150px] space-y-3">
                <div className="relative overflow-hidden rounded-lg">
                  <Link
                    href={`/series/${serie.url}-${serie.url_code}`}
                    prefetch={true}
                  >
                    <SeriesImage
                      src={serie.cover_image_url}
                      alt={serie.title}
                      width={150}
                      height={200}
                    />
                    {new Date().getTime() -
                      new Date(serie.updated_at).getTime() <
                      24 * 60 * 60 * 1000 && (
                      <Badge className="absolute top-2 right-2 bg-accent-500 text-text-50">
                        Updated
                      </Badge>
                    )}
                  </Link>
                  <BookmarkButton seriesUrl={serie.url} />
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/series/${serie.url}-${serie.url_code}/chapter-${serie.chapters[0].chapter_number}`}
                    prefetch={true}
                  >
                    <h3 className="font-semibold text-sm text-text-900 line-clamp-2 space-y-2">
                      {serie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-600  ">
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          Chapter {serie.chapters[0].chapter_number}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {formatDistanceToNow(
                            new Date(serie.chapters[0].updated_at)
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="bg-primary-100 hover:bg-primary-200"
          />
        </ScrollArea>
      </section>
    </div>
  );
}

export default ContinueContent;
