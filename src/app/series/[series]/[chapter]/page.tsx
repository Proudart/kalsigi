// src/app/series/[series]/[chapter]/page.tsx
import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import { lazyHydrate } from 'next-lazy-hydration-on-scroll';
import { Metadata } from "next";
import Script from "next/script";
import Loader from "../../../../components/load";

// Skeleton loader for chapter component
function ChapterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="h-16 w-3/4 bg-neutral-200 rounded-md mx-auto mt-8"></div>
        <div className="mt-8 space-y-4 max-w-3xl mx-auto">
          <div className="h-4 bg-neutral-200 rounded-md w-full"></div>
          <div className="h-[500px] bg-neutral-200 rounded-md w-full"></div>
          <div className="h-10 bg-neutral-200 rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );
}

// Enhanced components with better loading strategy
const Chapter = lazyHydrate(() => import("../../../../components/chapter/chapter"), {
  LoadingComponent: ChapterSkeleton,
  wrapperElement: 'div'
});

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
  url_code: string;
  chapters: ChapterData[];
}

async function fetchChapterData(url: string): Promise<SeriesData> {
  const siteName = process.env.site_name;
  const response = await fetch(
    `https://www.${siteName}.com/api/chapter?series=${url}`,
    {
      method: "GET",
      next: {
        revalidate: 60 * 60 * 6, // Revalidate every 6 hours for better performance
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter data: ${response.statusText}`);
  }

  return response.json();
}

async function checkAndRedirectChapter(seriesParam: string, chapterParam: string) {
  
  const regex = /-(\d{6})$/;
  const match = seriesParam.match(regex);
  
  // Extract base URL (with or without code)
  const baseUrl = match ? seriesParam.replace(regex, '') : seriesParam;
  
  let data;
  try {
    // Only catch errors from the API call
    data = await fetchChapterData(baseUrl);
  } catch (error) {
    return null;
  }
  
  // Redirects happen outside the try-catch
  const expectedCode = data.url_code || '000000';
  const providedCode = match?.[1];
  
  // Build the correct series URL
  const correctSeriesUrl = `${data.url}-${expectedCode}`;
  
  // Check if we need to redirect due to URL issues
  if (!match || providedCode !== expectedCode) {
    permanentRedirect(`/series/${correctSeriesUrl}/${chapterParam}`);
  }
  
  // Check if the chapter exists
  const chapterNumber = chapterParam.replace(/^chapter-/i, '');
  const chapterExists = data.chapters.some(
    (ch: ChapterData) => ch.chapter_number.toString() === chapterNumber
  );
  
  if (!chapterExists) {
    permanentRedirect(`/series/${correctSeriesUrl}`);
  }
  
  return data;
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
      `https://www.${process.env.site_name}.com/api/chapters`,
      {
        next: { 
          revalidate: 60 * 60 * 24 // Cache for a day
        }
      }
    );

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
  
  // Check and redirect if URL is incorrect
  await checkAndRedirectChapter(params.series, params.chapter);
  
  return <Chapter {...props} wrapperProps={{ className: 'chapter-container' }} />;
}