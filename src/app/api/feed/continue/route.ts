import { db } from "../../../../util/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.get("titles")?.split(",") || [];
  const titles = params.map((param) => param.split(":")[0]);
  const chapterC = params.map((param) => param.split(":")[1]);
  const result = await db.query.series
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
    .prepare("continue")
    .execute();

  // Sort chapters by update_time


  result.map((manga: { chapters: any[]; url: any }) => {
    manga.chapters.sort((a: { chapter_number: number }, b: { chapter_number: number }) => b.chapter_number - a.chapter_number);
    let mangaIndex = titles.indexOf(manga.url);
    const indexs = manga.chapters.findIndex((chapter: { chapter_number: string }) => {
      return Number(chapter.chapter_number) === Number(chapterC[mangaIndex]);
    });


    manga.chapters.splice(0, indexs - 1);
    manga.chapters.splice(1);
  });


  return NextResponse.json(result);
}

export const revalidate = 3600;
