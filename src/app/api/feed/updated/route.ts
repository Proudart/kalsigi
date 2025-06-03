import { db } from "../../../../util/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.get("titles")?.split(",") || [];
  const titles = params.map((param) => param.split(":")[0]);
  const chapterC = params.map((param) => param.split(":")[1]);

  let result = await db.query.series
    .findMany({
      columns: {
        title: true,
        url: true,
        cover_image_url: true,
        updated_at: true,
        url_code: true,
      },
      where: (series, { inArray }) => inArray(series.url, titles),
      with: {
        chapters: {
          columns: {
            chapter_number: true,
            updated_at: true,
            publisher: true,
          },
        },
      },
    })
    .prepare("updated")
    .execute();

   let results = result.map((manga: { chapters: any[]; url: any }) => {
    manga.chapters.sort((a: { chapter_number: string }, b: { chapter_number: string }) =>
      parseFloat(b.chapter_number) - parseFloat(a.chapter_number)
    );

    const mangaIndex = titles.indexOf(manga.url);
    const userChapter = chapterC[mangaIndex];

    // If the newest chapter matches the user's chapter, return null
    if (manga.chapters[0]?.chapter_number == userChapter) {
      return null;
    }

    const indexs = manga.chapters.findIndex((chapter: { chapter_number: string }) => {
      return chapter.chapter_number == userChapter;
    });

    manga.chapters.splice(0, indexs - 1);
    manga.chapters.splice(1);

    return manga;
  });

  // Filter out null entries and manga with no chapters
  results = results.filter((manga: { chapters: any[] } | null) => 
    manga !== null && manga.chapters.length > 0
  );
  return NextResponse.json(results);
}

function formatDistanceToNow(date: Date) {
  const diff = Date.now() - date.getTime();
  const years = Math.floor(diff / 31536000000);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let result = "now";
  if (years > 0) result = `${years}yr`;
  else if (months > 0) result = `${months}mo`;
  else if (days > 0) result = `${days}d`;
  else if (hours > 0) result = `${hours}h`;
  else if (minutes > 0) result = `${minutes}m`;


  return result;
}

export const revalidate = 3600;