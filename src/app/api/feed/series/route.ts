import { db } from "../../../../util/db";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

// Remove the dynamic export as it's not needed with revalidation
export const dynamic = "force-dynamic";

// Set revalidation time to 1 hour (3600 seconds)
// export const revalidate = 3600;

// Remove the simple cache as Next.js will handle caching with revalidation
// const offsetCache = new Map();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") as unknown as number;
  const order = searchParams.get("sort") as unknown as string;

  let orderByClause;
  let result;
  if (order === "Latest Updates") {
    orderByClause = (series: { updated_at: any }, { desc }: any) => [
      desc(series.updated_at),
    ];
  } else if (order === "Trending") {
    orderByClause = (series: { today_views: any }, { desc }: any) => [
      desc(series.today_views),
    ];
  }
  const queryOptions = {
    columns: {
      title: true,
      url: true,
      cover_image_url: true,
      updated_at: true,
      url_code: true,
    },
    limit: 25,
    offset: offset,
    orderBy: orderByClause,
    where: sql`updated_at IS NOT NULL`, // Filter series with at least one chapter
    with: {
      chapters: {
        columns: {
          chapter_number: true,
          published_at: true,
        },
      },
    },
  };
 
  
  const prepared = db.query.series
    .findMany(queryOptions)
    .prepare(`${offset}-${order}`);

  result = await prepared.execute();

  result.forEach((manga: { chapters: any[] }) => {
    manga.chapters.sort((a, b) => b.chapter_number - a.chapter_number);
    manga.chapters.splice(1, manga.chapters.length - 1);
  });

  // Convert date to a relative format
  const currentTime = Date.now();
  result.forEach((manga: { chapters: any[] }) => {
    manga.chapters.forEach((chapter: {
      published_at: string
}) => {
      const diff = currentTime - new Date(chapter.published_at).getTime();
      const timeString = getRelativeTimeString(diff);
      chapter.published_at = timeString;
    });
  });

  return NextResponse.json(result);
}

// Helper function to get relative time string
function getRelativeTimeString(diff: number) {
  const years = Math.floor(diff / 31536000000);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (years > 0) return `${years}yr`;
  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
}