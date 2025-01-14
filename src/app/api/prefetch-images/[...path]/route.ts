import { db } from "@/util/db";
import { series, chapters } from "@/util/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

interface ImageMetadata {
  src: string;
  srcset: string;
  sizes: string;
  alt: string;
  loading: "eager";
}

export async function GET(request: NextRequest) {
  try {
    // Get the path from the URL
    const pathname = request.nextUrl.pathname.replace("/api/prefetch-images", "");
    
    // Extract series URL and chapter from pathname
    const seriesMatch = pathname.match(/\/series\/([^\/]+)(?:\/([^\/]+))?/);
    if (!seriesMatch) {
      return new Response(JSON.stringify({ images: [] }));
    }

    const seriesUrl = seriesMatch[1].replace(/-\d{6}$/, ""); // Remove URL code
    let chapter = seriesMatch[2]; // Will be undefined for series pages
    
    // First, fetch the series data
    const seriesData = await db.query.series.findFirst({
      where: eq(series.url, seriesUrl),
      columns: {
        title: true,
        cover_image_url: true
      }
    });

    if (!seriesData) {
      return new Response(JSON.stringify({ images: [] }));
    }

    // If this is a chapter page
    if (chapter) {
      // Extract the numeric part from chapter string
      const chapterNumber = chapter.replace(/^chapter-/i, '');
      
      // Use the series title to fetch chapter data
      const chapterData = await db.query.chapters.findFirst({
        where: and(
          eq(chapters.title, seriesData.title),
          eq(chapters.chapter_number, chapterNumber)
        ),
        columns: {
          content: true
        }
      });

      if (!chapterData?.content) {
        console.error(`No content found for chapter ${chapterNumber} of ${seriesData.title}`);
        return new Response(JSON.stringify({ images: [] }));
      }

      // Ensure content is treated as an array of strings
      const contentArray = Array.isArray(chapterData.content) 
        ? chapterData.content 
        : [chapterData.content];

      // Map chapter images
      const chapterImages: ImageMetadata[] = contentArray.map(imageUrl => ({
        src: imageUrl,
        srcset: imageUrl,
        sizes: "100vw",
        alt: `${seriesData.title} ${chapter}`,
        loading: "eager"
      }));

      return new Response(JSON.stringify({ images: chapterImages }));
    }
    
    // For series pages, return the cover image
    if (!seriesData.cover_image_url) {
      return new Response(JSON.stringify({ images: [] }));
    }

    const images: ImageMetadata[] = [{
      src: seriesData.cover_image_url,
      srcset: seriesData.cover_image_url,
      sizes: "100vw",
      alt: seriesData.title || "",
      loading: "eager"
    }];

    return new Response(JSON.stringify({ images }));

  } catch (error) {
    console.error("Error in prefetch-images API:", error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return new Response(JSON.stringify({ 
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}