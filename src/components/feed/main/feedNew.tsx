// src/components/feed/main/feedNew.tsx
'use server'

import Image from "next/image";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { Link } from "../../../components/link";
import FeedNewSkeleton from "./feedNewSkeleton";
import { getBaseUrl } from "../../../lib/utils";

type Manga = {
  publisher: any;
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  chapters: {
    chapter_number: string;
    published_at: string;
    publisher: string;
  }[];
};

async function fetchMangaData(sort: string, offset: number): Promise<Manga[]> {
  const url = `${getBaseUrl()}/api/feed/series?offset=${offset}&sort=${sort}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // Revalidate every 1 hour (3600 seconds)
  });

  if (!res.ok) throw new Error('Failed to fetch manga data');
  return await res.json();
}

const MangaImage = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={60}
      height={80}
      className="w-[60px] h-[80px] object-cover rounded-md aspect-2/3"
      loading="lazy"
      blurDataURL={`${src}&w=16&q=1`}
    />
  );
};

type Props = {
  title: string;
};

export default async function FeedNew({ title }: Props) {
  let data: Manga[] = [];
  let error: Error | null = null;
  
  try {
    data = await fetchMangaData(title, 0);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('Error fetching manga data:', error);
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        <div className="h-[400px] w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
          <p className="text-sm text-red-700 dark:text-red-300">Unable to load data. Please try again later.</p>
        </div>
      </section>
    );
  }

  // Return null if no data to display
  if (data.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          {data.length} series
        </span>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <ScrollArea className="h-[400px] w-full">
          <div className="p-2">
            {data.map((manga, index) => (
              <div key={manga.title} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-900 rounded-lg mb-2 last:mb-0 hover:shadow-sm transition-shadow duration-200 border border-gray-100 dark:border-gray-800">
                {title === "Trending" && (
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 font-bold text-sm rounded-full">
                    {index + 1}
                  </div>
                )}

                <div className="w-[60px] h-[80px] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <MangaImage src={manga.cover_image_url} alt={manga.title} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    <Link href={`/series/${manga.url}-${manga.url_code}`} prefetch={true} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                      {manga.title}
                    </Link>
                  </h3>
                  <div className="space-y-1">
                    {manga.chapters.slice(0, 2).map((chapter) => (
                      <Link 
                        href={`/series/${manga.url}-${manga.url_code}/${manga.chapters[0].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${manga.chapters[0].chapter_number}`} 
                        key={chapter.chapter_number} 
                        className="text-sm text-gray-500 dark:text-gray-400 block hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" 
                        prefetch={true}>
                        Chapter {chapter.chapter_number} • {chapter.published_at}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}