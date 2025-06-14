// src/app/series/[series]/page.tsx
import { Suspense } from "react";
import { redirect, permanentRedirect } from "next/navigation";
import Manga from "../../../components/manga/manga";
import Loader from "../../../components/load";
import { Metadata } from "next";
import { getBaseUrl } from "../../../lib/utils";

function formatDate(dateString: any): any {
  const date = new Date(dateString);
  const now = new Date();
  
  // Format the actual date
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  // Calculate the time difference in milliseconds
  const timeDiff = now.getTime() - date.getTime();
  const secondsDiff = Math.floor(timeDiff / 1000);
  const minutesDiff = Math.floor(secondsDiff / 60);
  const hoursDiff = Math.floor(minutesDiff / 60);
  const daysDiff = Math.floor(hoursDiff / 24);
  const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  const yearsDiff = Math.floor(monthsDiff / 12);

  // Generate relative time string
  let relativeTime = '';
  if (secondsDiff < 60) {
    relativeTime = 'just now';
  } else if (minutesDiff < 60) {
    relativeTime = `${minutesDiff} ${minutesDiff === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hoursDiff < 24) {
    relativeTime = `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'} ago`;
  } else if (daysDiff < 30) {
    relativeTime = `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
  } else if (monthsDiff < 12) {
    relativeTime = `${monthsDiff} ${monthsDiff === 1 ? 'month' : 'months'} ago`;
  } else {
    relativeTime = `${yearsDiff} ${yearsDiff === 1 ? 'year' : 'years'} ago`;
  }

  return `${formattedDate} • ${relativeTime}`;
}

// Types based on the database schema
type Chapter = {
  id: string;
  chapter_number: number;
  title: string | null;
  publisher: string;
  published_at: string;
  updated_at: string;
};

type Series = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  cover_image_url: string | null;
  total_chapters: number | null;
  chapters: Chapter[];
  publisher: string;
  url_code: string;
  genre: string[];
};

type RouteParams = {
  params: {
    series: string;
  };
};

async function fetchSeriesData(url: string): Promise<Series> {
  const siteName = process.env.site_name;
  const response = await fetch(`${getBaseUrl()}/api/title?url=${url}`, {
    method: "GET",
    next: {
      revalidate: 60 * 60 * 24 // Revalidate every 24 hours
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch series data: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to check if URL has correct format and redirect if needed
async function checkAndRedirectSeries(seriesParam: string) {
  
  const regex = /-(\d{6})$/;
  const match = seriesParam.match(regex);
  
  // Extract base URL (with or without code)
  const baseUrl = match ? seriesParam.replace(regex, '') : seriesParam;

  let data: Series;
  try {
    // Only catch errors from the API call
    data = await fetchSeriesData(baseUrl);
  } catch (error) {
    return null;
  }

  // All redirect logic happens outside try-catch
  const expectedCode = data.url_code || '000000';
  const providedCode = match?.[1];
  
  // Build the correct series URL
  const correctUrl = `${data.url}-${expectedCode}`;

  // Check if we need to redirect
  if (!match) {
    // No URL code found
    permanentRedirect(`/series/${correctUrl}`);
  } else if (providedCode !== expectedCode) {
    // Wrong URL code
    permanentRedirect(`/series/${correctUrl}`);
  }

  // URL is correct, return the data
  return data;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { series } = await params;
  const siteName = process.env.site_name as string;
  const baseUrl = getBaseUrl();
  
  // Remove the URL code suffix (e.g., -123456)
  const regex = /-\d{6}/;
  const modifiedUrl = series.replace(regex, '');

  try {
    const data = await fetchSeriesData(modifiedUrl);
    
    const pageUrl = `${baseUrl}/series/${series}`;
    const chaptersWithFormattedDates = data.chapters.map(chapter => ({
      ...chapter as any,
      formatted_date: formatDate(chapter.published_at) as any
    })) as any;
    const filteredGenres = data.genre.filter(genre => genre.toLowerCase() !== 'null');
    const description = `${chaptersWithFormattedDates[0].formatted_date} - ${data.title} - ${filteredGenres.length > 0 ? `Genre: ${filteredGenres.join(', ')}` : ''} - ${data.description || 'N/A'}`;
    const commonKeywords = [
      `Latest ${data.title} chapters`,
      `Latest chapter ${chaptersWithFormattedDates[0].formatted_date} chapter ${chaptersWithFormattedDates[0].chapter_number}`,
      "read online",
      `${siteName}.com`,
      ...data.title.split(' '),
    ];
    return {
      title: `${data.title} | ${siteName}`,
      description: description,
      keywords: commonKeywords,
      metadataBase: new URL(baseUrl),
      
      openGraph: {
        title: `${data.title} | ${siteName}`,
        description: description || `Read ${data.title} online at ${siteName}.com`,
        type: "article",
        url: pageUrl,
        siteName: `${siteName}.com`,
        images: data.cover_image_url ? [
          {
            url: data.cover_image_url,
            width: 800,
            height: 600,
            alt: data.title,
          },
        ] : undefined,
        locale: "en_US",
      },
      
      twitter: {
        card: "summary_large_image",
        site: `@${siteName}`,
        creator: `@${siteName}`,
        title: `${data.title} | ${siteName}`,
        description: description || `Read ${data.title} online at ${siteName}.com`,
        images: data.cover_image_url ? [
          {
            url: data.cover_image_url,
            width: 800,
            height: 600,
            alt: data.title,
          },
        ] : undefined,
      },
    };
  } catch (error) {
    // Fallback metadata for errors
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
      keywords: ["read", "online", siteName, `${siteName}.com`],
    };
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/titles`);
    const data = await res.json();
    return data.map((series: any) => ({
      series: series.url.toString() + '-' + (series.url_code ? series.url_code.toString() : '000000'),
    }));
  } catch (e) {
    return [];
  }
}

export default async function SingleSeries(props: any) {
  const params = await props.params;
  
  // Check and redirect if URL is incorrect
  const data = await checkAndRedirectSeries(params.series);
  
  if (!data) {
    // Series not found, Next.js will handle 404
    throw new Error('Series not found');
  }
  
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Manga params={params} />
      </Suspense>
    </>
  );
}