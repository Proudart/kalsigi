import { db } from "../../../util/db";
import { ratings } from "../../../util/schema";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";

export async function POST(request: Request) {
  const { seriesUrl, rating, userId } = await request.json();

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
    return new Response("Error submitting rating", { status: 500 });
  }
}
