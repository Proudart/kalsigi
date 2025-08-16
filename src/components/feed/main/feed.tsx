// src/components/feed/main/feed.tsx
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Link } from "../../../components/link";
import Image from "next/image";
import BookmarkButton from "../bookmarked";
import { Badge } from "../../../components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import FeedSkeleton from "./feedSkeleton";
import { getBaseUrl } from "../../../lib/utils";

type Manga = {
  publisher: any;
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  chapters: [{
    chapter_number: string;
    published_at: string;
    publisher: string;
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
  const url = `${getBaseUrl()}/api/feed/genre?offset=${offset}&genre=${genre}`;
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
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">Unable to load {title} manga. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (manga.length < 10) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <Link 
          href={`/series?genre=${encodeURIComponent(title)}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          View All
        </Link>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 pb-4">
          {manga.map((serie, index) => (
            <div key={serie.url + index} className="w-[160px] md:w-[180px] group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <Link href={`/series/${serie.url}-${serie.url_code}`} prefetch={true}>
                    <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <MangaImage src={serie.cover_image_url} alt={serie.title} />
                    </div>
                    {serie.chapters && serie.chapters.length > 0 && 
                      ((serie.chapters[0].published_at.includes("h") ||
                        (serie.chapters[0].published_at.includes("m") && 
                         !serie.chapters[0].published_at.includes("mo"))) && (
                        <div className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Updated
                        </div>
                      ))}
                  </Link>
                  <BookmarkButton seriesUrl={serie.url} />
                </div>
                
                <div className="space-y-2">
                  {serie.chapters && serie.chapters.length > 0 ? (
                    <Link href={`/series/${serie.url}-${serie.url_code}/${serie.chapters[0].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${serie.chapters[0].chapter_number}`} prefetch={true}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">Ch. {serie.chapters[0].chapter_number}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{serie.chapters[0].published_at}</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {serie.title}
                    </h3>
                  )}
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

export default function GenreSlider({ title }: Props) {
  return (
    <div className="w-full">
      <GenreFeed title={title} />
    </div>
  );
}