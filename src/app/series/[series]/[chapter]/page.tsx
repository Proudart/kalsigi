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

interface RouteParams {
  params: {
    series: string;
    chapter: string;
  };
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
    const chapterTitle = chapter.charAt(0).toUpperCase() + chapter.slice(1);
    const fullTitle = `${data.title} ${chapterTitle} | Read Online At ${siteName}`;
    const pageUrl = `${baseUrl}/series/${series}/${chapter}`;

    // Enhanced keywords using summary data
    const keywords = [
      data.title,
      `${data.title} ${chapterTitle}`,
      `${data.title} read online`,
      summary.keywords ? (Array.isArray(summary.keywords) ? summary.keywords.join(', ') : summary.keywords) : '',
      summary.tldr || '',
      data.description?.slice(0, 100) || "",
    ].filter(Boolean).join(", ");

    // Enhanced description using summary data
    const description = `${summary.tldr || ''} ${summary.synopsis || ''} - Read ${data.title} ${chapterTitle} online at ${siteName}.com`;

    const metadata: Metadata = {
      title: fullTitle,
      description: description.trim(),
      keywords,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: fullTitle,
        description: description.trim(),
        type: "article",
        url: pageUrl,
        siteName: `${siteName}.com`,
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
        images: data.cover_image_url ? [{
          url: data.cover_image_url,
          width: 1200,
          height: 630,
          alt: `Cover image for ${data.title}`
        }] : undefined
      }
    };

    return metadata;
  } catch (error) {
    // Fallback metadata remains unchanged
    return {
      title: `404 | ${siteName}`,
      description: `Read manga online at ${siteName}.com`,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: `404 | ${siteName}`,
        description: `Read manga online at ${siteName}.com`,
        type: "website",
        url: baseUrl,
        siteName: `${siteName}.com`,
      },
      keywords: `manga, webtoons, read online, ${siteName}`,
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
  const { series, chapter } = params;
  const siteName = process.env.site_name;
  const baseUrl = `https://www.${siteName}.com`;

  const regex = /-\d{6}/;
  const modifiedUrl = series.replace(regex, "");

  const data = await fetchChapterData(modifiedUrl);

  const chapterTitle = chapter.charAt(0).toUpperCase() + chapter.slice(1);
  const fullTitle = `${data.title} ${chapterTitle} | Read Online  | ${siteName}`;
  const description =
    data.description ||
    `Read ${data.title} ${chapterTitle} online  at ${siteName}.com`;
  const pageUrl = `${baseUrl}/series/${series}/${chapter}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    headline: fullTitle,
    image: data.cover_image_url,
    author: data.author
      ? {
          "@type": "Person",
          name: data.author,
        }
      : {
          "@type": "Organization",
          name: siteName,
        },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/kalsigi.webp`,
      },
    },
    datePublished: data.chapters[0]?.published_at,
    dateModified: data.chapters[0]?.updated_at,
    isPartOf: {
      "@type": "ComicSeries",
      name: data.title,
      url: `${baseUrl}/series/${series}`,
    },
  };

  return (
    <div>
      <Script
        id="jsonld-chapter"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<Loader />}>
        <Chapter params={params} />
      </Suspense>
    </div>
  );
}
