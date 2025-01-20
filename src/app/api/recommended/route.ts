import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/util/db';
import { sql } from 'drizzle-orm';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genres = searchParams.get('genres')?.split(',') || [];
  const currentSeriesId = searchParams.get('seriesId');
  const limit = 5;
  if (!currentSeriesId) {
    return NextResponse.json({ error: 'Missing series ID' }, { status: 400 });
  }
  try {
    let recommendations;

    if (genres.includes('Random') || genres.length === 0 || genres.includes('Null') || genres.includes('')) {
      // Return random series when no genres are provided
      recommendations = await db.execute(sql`
        SELECT
s.id,   
          s.title,
          s.url,
          s.cover_image_url,
          s.description,
          s.genres,
          s.total_chapters,
          s.url_code,
          s.status,
          0 as matching_genres
        FROM
          series s
        ORDER BY
          RANDOM()
        LIMIT ${limit}
      `);
    } else {
      // Use genre-based recommendations when genres are provided
      recommendations = await db.execute(sql`
        WITH input_genres AS (
          SELECT unnest(string_to_array(${genres.join(',')}, ',')) AS genre
        )
        SELECT
      s.id,
          s.title,
          s.url,
          s.cover_image_url,
          s.description,
          s.url_code,
          s.genres,
          s.total_chapters,
          s.status,
          (
            SELECT COUNT(*)
            FROM (SELECT unnest(s.genres) AS sg) sg
            WHERE sg = ANY(SELECT genre FROM input_genres)
          ) AS matching_genres
        FROM
          series s
        WHERE
          s.genres && ARRAY(SELECT genre FROM input_genres)
          AND s.id != ${currentSeriesId}
        ORDER BY
          matching_genres DESC
        LIMIT ${limit}
      `);
    }

    return NextResponse.json(recommendations.rows);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}