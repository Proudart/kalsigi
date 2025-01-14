'use server'

import Image from "next/image";
import { ScrollArea } from "../../../components/ui/scroll-area"
import { ChevronRight } from "lucide-react";
import { Link } from "../../../components/link";

type Manga = {
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  chapters: {
    chapter_number: string;
    published_at: string;
  }[];
};

async function fetchMangaData(sort: string, offset: number): Promise<Manga[]> {
  const url = `https://www.${process.env.site_name}.com/api/feed/series?offset=${offset}&sort=${sort}`;
  // const url = `http://localhost:3000/api/feed/series?offset=${offset}&sort=${sort}`;

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
      className="w-[60px] h-[80px] object-cover rounded-md aspect-[2/3]"
      loading="lazy"
      placeholder="blur"
      blurDataURL={`${src}&w=16&q=1`}
    />
  );
};

type Props = {
  title: string;
};

export default async function FeedNew({ title }: Props) {
  let data: Manga[] = [];
  try {
    data = await fetchMangaData(title, 0);
  } catch (error) {
    console.error('Error fetching manga data:', error);
    return null;
  }
  if (data.length === 0) {
    return null;
  }
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <ScrollArea className="h-[400px] w-full rounded-md border bg-background-300">
        {data.map((manga, index) => (
          <div key={manga.title} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
            {title === "Trending" && (
              <span className="font-bold text-xl w-6">{index + 1}</span>
            )}

            <MangaImage src={manga.cover_image_url} alt={manga.title} />
            <div>
              <h3 className="font-semibold">
                <Link href={`/series/${manga.url}-${manga.url_code}`} prefetch={true}>
                  {manga.title}
                </Link>
              </h3>
              {manga.chapters.map((chapter) => (
                <Link href={`/series/${manga.url}-${manga.url_code}/chapter-${manga.chapters[0].chapter_number}`} key={chapter.chapter_number} className="text-sm text-muted-foreground" prefetch={true}>
                  chapter-{chapter.chapter_number} - {chapter.published_at}
                </Link>
              ))}
            </div>
            <ChevronRight className="ml-auto" />
          </div>
        ))}
      </ScrollArea>
    </section>
  );
}