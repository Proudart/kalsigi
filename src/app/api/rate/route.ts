import { db } from "../../../util/db";
import { ratings } from "../../../util/schema";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";

export async function POST(request: Request) {
  const { seriesUrl, rating, userId } = await request.json();
  console.log(seriesUrl, rating, userId);
  // Check if userId is provided
  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  try {
    const existingRating = await db.query.ratings.findFirst({
      where: and(
        eq(ratings.series_url, seriesUrl),
        eq(ratings.user_id, userId)
      ),
    });

    if (existingRating) {
      // Update the existing rating
      await db
        .update(ratings)
        .set({ rating })
        .where(eq(ratings.id, existingRating.id));
    } else {
      // Create a new rating
      await db.insert(ratings).values({
        series_url: seriesUrl,
        rating,
        user_id: userId,
        created_at: new Date(),
      });
    }

    return new Response("Rating submitted successfully");
  } catch (error) {
    console.error(error);
    return new Response("Error submitting rating", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesUrl = searchParams.get('seriesUrl');
  const userId = searchParams.get('userId');

  if (!userId || !seriesUrl) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const existingRating = await db.query.ratings.findFirst({
      where: and(
        eq(ratings.series_url, seriesUrl),
        eq(ratings.user_id, userId)
      ),
    });

    return new Response(JSON.stringify({ rating: existingRating?.rating || 0 }));
  } catch (error) {
    return new Response("Error fetching rating", { status: 500 });
  }
}
