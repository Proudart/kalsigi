import { db } from "../../../util/db";
import { NextResponse } from "next/server";
import { series } from "@/util/schema";
import { eq, sql } from "drizzle-orm";

interface Chapter {
  id: number;
  chapter_number: string;
  content: string[];
  publisher: string;
  updated_at: Date;
  striked: boolean;
  summary?: {
    tldr?: string;
    synopsis?: string;
    keywords?: any;
  };
}

interface SeriesData {
  title: string;
  description: string;
  chapters: Chapter[];
}

const offsetCache = new Map<string, { data: SeriesData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("series");

    if (!url) {
      return NextResponse.json({ error: "Series URL is required" }, { status: 400 });
    }

    // Check cache
    const cachedData = offsetCache.get(url);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    const result = await db.query.series.findFirst({
      where: eq(series.url, url),
      columns: {
        id: true,
        url: true,
        title: true,
        description: true,
        cover_image_url: true,
        status: true,
        created_at: true,
        updated_at: true,
        publisher: true,
        artist: true,
        author: true,
        genre: true,
        total_chapters: true,
        url_code: true,
      },
      with: {
        chapters: {
          columns: {
            id: true,
            chapter_number: true,
            content: true,
            publisher: true,
            published_at: true,
            striked: true,
          },
          with: {
            summary: {
              columns: {
                tldr: true,
                synopsis: true,
                keywords: true,
              },
            },
          },
        },
      },
    }) as any
    
    if (!result) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }


    const chaptersWithSummary = result.chapters.map((chapter: { summary: { tldr: any; synopsis: any; keywords: any; }; }) => ({
      ...chapter,
      summary: chapter.summary ? {
        tldr: chapter.summary.tldr,
        synopsis: chapter.summary.synopsis,
        keywords: chapter.summary.keywords,
      } : undefined,
    }));

    result.chapters = chaptersWithSummary;
    // Format dates and sort chapters
    const formattedResult = {
      ...result,
      chapters: result.chapters
        .map((chapter: { published_at: any; content: string[] | null; }) => ({
          ...chapter,
          update_time: formatDate(chapter.published_at),
          content: sortChapterContent(chapter.content),
        }))
        .sort((a: { chapter_number: string; }, b: { chapter_number: string; }) => parseFloat(b.chapter_number) - parseFloat(a.chapter_number)) 
    } as any;

    // Update cache
    offsetCache.set(url, {
      data: formattedResult as any,
      timestamp: Date.now()
    });

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error fetching series data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to format dates
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



// Helper function to sort chapter content
function sortChapterContent(content: string[] | null): string[] {
  if (!content || !Array.isArray(content)) return [];

  return content.sort((a, b) => {
    try {
      const numA = parseInt(a.split('/').pop()?.split('.')[0] || '0');
      const numB = parseInt(b.split('/').pop()?.split('.')[0] || '0');
      return numA - numB;
    } catch {
      return 0;
    }
  });
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of offsetCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      offsetCache.delete(key);
    }
  }
}, CACHE_TTL);