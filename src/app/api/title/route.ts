import { db } from "../../../util/db";
import { NextResponse } from "next/server";
import { series } from "@/util/schema";
import { eq } from "drizzle-orm";

// Simple cache to store url results
const offsetCache = new Map();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") as string;

    // Check if the result is already in the cache
    if (offsetCache.has(url)) {
      const cachedResult = offsetCache.get(url);
      return NextResponse.json(cachedResult);
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
        today_views: true,
        total_views: true,

      },
      with: {
        chapters: {
          columns: {
            id: true,
            chapter_number: true,
            content: true,
            publisher: true,
            update_time: true,
            striked: true,
            published_at: true,
          },
        },
        ratings: {
          columns: {
            rating: true,
          },
        },
      },
    });

    // Handle case when result is not found
    if (!result) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Calculate average rating
    const ratingsData = result.ratings;
    const totalRatings = ratingsData.length;
    const sumRatings = ratingsData.reduce(
      (sum, rating) => sum + (rating.rating || 0),
      0
    );
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Format timestamps for chapters
    const now = new Date().getTime();
    const formattedChapters = result.chapters.map((chapter) => ({
      ...chapter,
      update_time: formatTimeAgo(new Date(chapter.published_at).getTime(), now),
    }));

    // Sort chapters by number (descending)
    const sortedChapters = formattedChapters.sort((a, b) => {
      return b.chapter_number - a.chapter_number;
    });

    // Prepare response data
    const responseData = {
      ...result,
      chapters: sortedChapters,
      averageRating,
    };
    // Store the result in cache
    offsetCache.set(url, responseData);
    console.log("Data fetched from database:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to format time differences
function formatTimeAgo(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`;
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (minutes > 0)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  return "Just now";
}
