import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../util/db";
import { series } from "@/util/schema";
import { inArray, sql } from "drizzle-orm";


export const revalidate = 3600;


export async function GET(request: NextRequest) {
  try {
    const limit = 10;
    const { searchParams } = new URL(request.url);
    const params = searchParams.get("titles")?.split(",") || [];
    const titles = params.map((param) => param.split(":")[0]);

    
    // Get genres of series the user has read
    const userGenresResult = await db
      .select({ genre: series.genre })
      .from(series)
      .where(inArray(series.url, titles));

    // Flatten and count genre occurrences
    const genreCounts: Record<string, number> = {};
    if (userGenresResult && userGenresResult.length > 0) {
      userGenresResult.forEach((row) => {
        if (Array.isArray(row.genre)) {
          row.genre.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
    } else {
      // If no genres are found, return an empty array
      return NextResponse.json([]);
    }

    // Sort genres by frequency and get top 5
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    if (topGenres.length === 0) {
      // If no top genres are found, return an empty array
      return NextResponse.json([]);
    }

    // Get recommended series based on top genres
    const recommendedSeries = await db.execute(sql`
      WITH top_genres AS (
        SELECT unnest(string_to_array(${topGenres.join(",")}, ',')) AS genre
      )
      SELECT
        id,
        title,
        url,
        cover_image_url,
        url_code,
        (
          SELECT COUNT(*)
          FROM unnest(series.genres) AS series_genre
          WHERE series_genre = ANY(SELECT genre FROM top_genres)
        ) AS matching_genres
      FROM
        series
      WHERE
        series.genres && (SELECT array_agg(genre) FROM top_genres)
        AND series.url != ALL(string_to_array(${titles.join(",")}, ','))
      ORDER BY
        matching_genres DESC
      LIMIT ${limit}
    `);

    // Transform the data to match the expected format
    const transformedData = recommendedSeries.rows.map((row: any) => ({
      title: row.title,
      url: row.url,
      cover_image_url: row.cover_image_url,
      url_code: row.url_code,
      // Add any other fields that UpdatedContent expects
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching series recommendations:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching series recommendations" },
      { status: 500 }
    );
  }
}