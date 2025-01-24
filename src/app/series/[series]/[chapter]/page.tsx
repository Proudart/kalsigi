import { Suspense } from "react";
import Chapter from "../../../../components/chapter/chapter";
import Script from "next/script";
import Loader from "../../../../components/load";
import { Metadata } from "next";

// Types based on your database schema
interface ChapterData {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string | null;
  content: object;
  views: number;
  publisher: string;
  published_at: string;
  updated_at: string;
  update_time: string;
  summary?: {
    keywords?: string | string[];
    tldr?: string;
    synopsis?: string;
  };
}
interface SeriesData {
  genre: any;
  id: string;
  title: string;
  url: string;
  description: string | null;
  cover_image_url: string | null;
  type: string[] | null;
  total_chapters: number | null;
  author: string | null;
  artist: string | null;
  status: string | null;
  publisher: string;
  chapters: ChapterData[];

}



async function fetchChapterData(url: string): Promise<SeriesData> {
  const siteName = process.env.site_name;
  const response = await fetch(
    `https://www.${siteName}.com/api/chapter?series=${url}`,
    {
      method: "GET",
      next: {
        revalidate: 60 * 60 * 24, // Revalidate every 24 hours
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter data: ${response.statusText}`);
  }

  return response.json();
}
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { series, chapter } = await params;
  const siteName = process.env.site_name;
  const baseUrl = `https://www.${siteName}.com`;
  const regex = /-\d{6}/;
  const modifiedUrl = series.replace(regex, "");

  try {
    const data = await fetchChapterData(modifiedUrl);
    const chapterData = data.chapters.find(
      (ch: ChapterData) => `chapter-${ch.chapter_number}` === chapter
    );

    const summary = chapterData?.summary || {};
    const chapterTitle = `Chapter ${chapterData?.chapter_number}`;
    const fullTitle = `${data.title} ${chapterTitle} - Read Online | ${siteName}`;
    const pageUrl = `${baseUrl}/series/${series}/${chapter}`;

    const keywords = [
      data.title,
      `${data.title} manga`,
      `${data.title} ${chapterTitle}`,
      `read ${data.title} online`,
      data.genre?.join(', '),
      data.author,
      data.status,
      Array.isArray(summary.keywords) ? summary.keywords.join(', ') : summary.keywords,
      'online manga reader'
    ].filter(Boolean).join(", ");

    const description = `Read ${data.title} ${chapterTitle} online. ${summary.tldr || ''} ${data.description?.slice(0, 150)}... Continue reading at ${siteName}.`;
    return {
      title: fullTitle,
      description: description.trim(),
      keywords,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: pageUrl,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      openGraph: {
        title: fullTitle,
        description: description.trim(),
        type: "article",
        url: pageUrl,
        siteName: `${siteName}`,
        locale: "en_US",
        images: data.cover_image_url ? [{
          url: data.cover_image_url,
          width: 1200,
          height: 630,
          alt: `Cover image for ${data.title}`
        }] : undefined
      },
      twitter: {
        card: "summary_large_image",
        site: `@${siteName}`,
        creator: `@${siteName}`,
        title: fullTitle,
        description: description.trim(),
        images: data.cover_image_url ? [data.cover_image_url] : undefined
      }
    };
  } catch (error) {
    return {
      title: `404 Not Found | ${siteName}`,
      description: `Read manga and comics online at ${siteName}.`,
      robots: { index: false }
    };
  }
}


export async function generateStaticParams() {
  try {
    const response = await fetch(
      `https://www.${process.env.site_name}.com/api/chapters`
    );
    // const response = await fetch(http://localhost:3000/api/chapters);

    const seriesData = await response.json();

    return seriesData.flatMap(
      (series: { chapters: any[]; url: string; url_code: string }) =>
        series.chapters.map((chapter: { chapter_number: string }) => ({
          series: series.url + "-" + (series.url_code ? series.url_code.toString() : '000000'),
          chapter: "chapter-" + chapter.chapter_number.toString(),
        }))
    );
  } catch (e) {
    return [];
  }
}

export default async function ChapterPage(props: any) {
  const params = await props.params;
  const { series, chapter } = await params;
  const siteName = process.env.site_name;
  const baseUrl = `https://www.${siteName}.com`;

  const regex = /-\d{6}/;
  const modifiedUrl = series.replace(regex, "");

  const data = await fetchChapterData(modifiedUrl);

  // Structured Data implementation
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "name": `${data.title} - Chapter ${chapter}`,
    "isPartOf": {
      "@type": "ComicSeries",
      "name": data.title,
      "author": {
        "@type": "Person",
        "name": data.author
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": process.env.site_name,
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_BASE_URL}/skaihua.png`
      }
    },
    "datePublished": data.chapters[0]?.published_at,
    "dateModified": data.chapters[0]?.updated_at,
    "image": data.cover_image_url,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL}/series/${series}/${chapter}`,
    "description": data.description,
    "genre": data.genre,
    "inLanguage": "en",
    "accessMode": "visual",
    "accessibilityFeature": ["readingOrder", "unlocked"],
    "potentialAction": {
      "@type": "ReadAction",
      "target": `${process.env.NEXT_PUBLIC_BASE_URL}/series/${series}/${chapter}`
    }
  };

  return (
    <div>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<Loader />}>
        <Chapter params={params} />
      </Suspense>
    </div>
  );
}
