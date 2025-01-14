// app/api/search/route.ts
import { db } from "../../../util/db";
import { NextResponse } from "next/server";
import { series, ratings } from "@/util/schema";
import { sql, and, or, gte, lte, eq, desc, asc, inArray } from "drizzle-orm";
import { url } from "inspector";

const PAGE_SIZE = 18;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Number(searchParams.get("offset") || 0);
    const search = searchParams.get("search") || undefined;
    const genreFilter = searchParams.get("genres") || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const dateStart = searchParams.get("dateStart") || undefined;
    const dateEnd = searchParams.get("dateEnd") || undefined;
    const minRating = Number(searchParams.get("minRating") || 0);
    const statusFilter = searchParams.get("status") || "";

    const selectedGenres = genreFilter
      ? genreFilter.split(",").filter((g) => g !== "Null")
      : [];
    const selectedStatus = statusFilter ? statusFilter.split(",") : [];

    const whereClause = [];

    if (search) {
      whereClause.push(sql`${series.title} ILIKE ${`%${search}%`}`);
    }

    if (selectedGenres.length > 0) {
      whereClause.push(
        sql`${series.genre} && ARRAY[${selectedGenres.join(",")}]::text[]`
      );
    }

    if (dateStart) {
      whereClause.push(gte(series.release_date, new Date(dateStart)));
    }

    if (dateEnd) {
      whereClause.push(lte(series.release_date, new Date(dateEnd)));
    }

    if (selectedStatus.length > 0) {
      whereClause.push(inArray(series.status, selectedStatus));
    }

    const avgRatingSubquery = db
      .select({
        seriesUrl: ratings.series_url,
        avgRating: sql<number>`AVG(${ratings.rating})`.as("avg_rating"),
      })
      .from(ratings)
      .groupBy(ratings.series_url)
      .as("avg_ratings");

    let query = db
      .select({
        title: series.title,
        url: series.url,
        cover_image_url: series.cover_image_url,
        genre: series.genre,
        release_date: series.release_date,
        status: series.status,
        total_views: series.total_views,
        avgRating: avgRatingSubquery.avgRating,
        url_code: series.url_code,
      })
      .from(series)
      .leftJoin(avgRatingSubquery, eq(series.url, avgRatingSubquery.seriesUrl));

    if (whereClause.length > 0) {
      query = query.where(and(...whereClause)) as any;
    }

    if (sortBy === "rating") {
      query = query.orderBy(
        sortOrder === "desc"
          ? desc(avgRatingSubquery.avgRating)
          : asc(avgRatingSubquery.avgRating)
      ) as any;
    } else {
      const sortColumn = series[sortBy as keyof typeof series];
      if (sortColumn) {
        query = query.orderBy(
          sortOrder === "desc"
            ? desc(sortColumn as any)
            : asc(sortColumn as any)
        ) as any;
      }
    }

    query = query.limit(PAGE_SIZE).offset(offset) as any;

    const result = await query;

    const filteredResult = result.filter(
      (item) => (item.avgRating || 0) >= minRating
    );

    const totalCountQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(series);

    if (whereClause.length > 0) {
      totalCountQuery.where(and(...whereClause));
    }

    const totalCount = await totalCountQuery;

    return NextResponse.json([totalCount, filteredResult]);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
