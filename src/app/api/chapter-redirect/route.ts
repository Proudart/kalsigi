import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/util/db';
import { series, chapters } from '@/util/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesUrl = searchParams.get('series');
    const chapterNumber = searchParams.get('chapter');

    if (!seriesUrl || !chapterNumber) {
      return NextResponse.json(
        { error: 'Missing series or chapter parameter' },
        { status: 400 }
      );
    }

    // Find the series
    const seriesData = await db
      .select({
        id: series.id,
        url: series.url,
        url_code: series.url_code,
        title: series.title
      })
      .from(series)
      .where(eq(series.url, seriesUrl))
      .limit(1);

    if (seriesData.length === 0) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }

    const seriesInfo = seriesData[0];

    // Find all chapters with this number for this series
    const chapterData = await db
      .select({
        id: chapters.id,
        chapter_number: chapters.chapter_number,
        publisher: chapters.publisher,
        published_at: chapters.published_at
      })
      .from(chapters)
      .where(and(
        eq(chapters.series_id, seriesInfo.id),
        eq(chapters.chapter_number, chapterNumber)
      ))
      .orderBy(chapters.published_at); // Get the earliest published version

    if (chapterData.length === 0) {
      return NextResponse.json(
        { 
          error: 'Chapter not found',
          redirect: `/series/${seriesInfo.url}-${seriesInfo.url_code || '000000'}`
        },
        { status: 404 }
      );
    }

    // Return the first (earliest) publisher for this chapter
    const primaryChapter = chapterData[0];
    const publisherSlug = primaryChapter.publisher.toLowerCase().replace(/\s+/g, '-');
    const correctSeriesUrl = `${seriesInfo.url}-${seriesInfo.url_code || '000000'}`;

    return NextResponse.json({
      success: true,
      redirect: `/series/${correctSeriesUrl}/${publisherSlug}/chapter-${chapterNumber}`,
      alternatives: chapterData.map(ch => ({
        publisher: ch.publisher,
        slug: ch.publisher.toLowerCase().replace(/\s+/g, '-'),
        url: `/series/${correctSeriesUrl}/${ch.publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${chapterNumber}`
      }))
    });

  } catch (error) {
    console.error('Error in chapter redirect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}