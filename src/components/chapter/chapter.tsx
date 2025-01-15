import { Key } from "react";
import { Link } from "../../components/link";

import GenerateTags from "./generateTags";
import dynamic from "next/dynamic";

const ListboxComponent = dynamic(() => import("./chapterList"));
const ChapterContent = dynamic(() => import("./chapterContent"));
const ChapterChat = dynamic(() => import("./chapterChat"));
const Share = dynamic(() => import("../share"));
const Recommended = dynamic(() => import("../recommendations"));

export default async function Chapter({ params }: any) {
  const title = params.series;
  const chapter = params.chapter;
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");
  const res = await fetch(
    `https://www.${process.env.site_name}.com/api/chapter?series=${modifiedTitle}`
    // `http://localhost:3000/api/chapter?series=${modifiedTitle}`
  );

  const chapterNumber = chapter.replace(/^chapter-/i, "");
  const data = await res.json();
  let panels;
  let striked;
  let chapterId;
  let publisher;
  let date;
  let summary;
  try {
    panels = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).content;
    striked = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).striked;
    chapterId = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).id;
    publisher = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).publisher;
    date = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).published_at;
  } catch (error) {
    panels = [null, null];
    striked = false; // Default to not striked
    chapterId = null;
    publisher = null;
    date = null;
  }

  try {
    summary = data.chapters.find(
      (item: { chapter_number: any }) => item.chapter_number == chapterNumber
    ).summary;
  } catch (error) {
    summary = null;
  }
  return (
    <>
      <div
        className="flex-col items-center justify-center"
        key={title + chapter}
      >
        <div className="max-w-6xl mx-auto"></div>
        <h1 className="pt-16 pb-16 text-4xl font-bold text-center text-text-950">
          {data.title + " - " + chapter?.toString().replace(/-/g, " ")}
        </h1>
      </div>
      <div className="container mx-auto p-4 mt-6">
        <div data-nat="1424528"></div>
      </div>
      <article>
        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto">
          <ol className="flex flex-wrap justify-center mt-2 text-sm c4:justify-start gap-x-3 text-text-950">
            <li>
              <Link href="/" prefetch={true}>
                Home
              </Link>
            </li>
            /
            <li>
              <Link href="/series" prefetch={true}>
                Series
              </Link>
            </li>
            /
            <li>
              <Link href={"/series/" + title} prefetch={true}>
                {data.title}
              </Link>
            </li>
            /<li>{chapter}</li>
          </ol>
        </nav>

        {summary && (
          <div className="max-w-3xl mx-auto mt-4 mb-4 space-y-4">
            {summary.tldr && (
              <section
                className="bg-background-50 p-4 rounded-lg shadow-sm"
                aria-label="Chapter Summary"
              >
                <h2 className="text-lg font-semibold text-text-900 mb-2">
                  Quick Summary
                </h2>
                <p className="text-text-700">{summary.tldr}</p>
              </section>
            )}
          </div>
        )}
        <Share
          url={`https://www.${process.env.site_name}.com/series/${title}/${chapter}`}
          title={data.title + " - " + chapter?.toString().replace(/-/g, " ")}
        />

        <ListboxComponent
          chapters={data.chapters.map((item: any) => item.chapter_number)}
          title={data.title}
          chapter={chapter}
          url={modifiedTitle}
          urlCode={data.url_code}
        >
          {striked ? (
            <p className="flex flex-wrap justify-center">
              This chapter has been removed due to a complaint.
            </p>
          ) : (
            <ChapterContent panels={panels} title={data.title} chapter={chapter} />
          )}
        </ListboxComponent>

        <Share
          url={`https://www.${process.env.site_name}.com/series/${title}/${chapter}`}
          title={data.title + " - " + chapter?.toString().replace(/-/g, " ")}
        />
        <div data-nat="1424528"></div>
        {summary?.synopsis && (
          <div className="max-w-3xl mx-auto mt-4 mb-4 space-y-4">
            <section
              className="bg-background-50 p-4 rounded-lg shadow-sm"
              aria-label="Chapter Synopsis"
            >
              <h2 className="text-lg font-semibold text-text-900 mb-2">
                Synopsis
              </h2>
              <p className="text-text-700">{summary.synopsis}</p>
            </section>
          </div>
        )}
        <div className="container mx-auto p-4 mt-6">
          <Recommended genres={data.genre} seriesId={data.id} />
        </div>
        <div className="container mx-auto p-4 mt-6">
          <ChapterChat chapterId={chapterId} />
        </div>
        <div className="container mx-auto p-4 mt-6">
          <GenerateTags
            summary={summary}
            title={data.title}
            chapter={chapter}
            datePublished={date}
            publisher={publisher}
          />
        </div>
      </article>
    </>
  );
}
