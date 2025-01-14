"use client";

import React, { useEffect, useState } from "react";
import { Link } from "../../components/link";
import CustomSelectWithLink from "./customSelectWithLink";
import { setCookie, getCookie, hasCookie } from "cookies-next";
import pako from "pako";

function compressData(data: any): string {
  const compressed = pako.deflate(JSON.stringify(data));
  return Buffer.from(compressed).toString("base64");
}

function decompressData(input: string): any {
  try {
    const compressed = Buffer.from(input, "base64");
    const decompressed = pako.inflate(compressed);
    const jsonString = new TextDecoder().decode(decompressed);
    return JSON.parse(jsonString);
  } catch (error) {
    return JSON.parse(input);
  }
}

interface ListboxComponentProps {
  chapters: string[];
  title: string;
  chapter: string;
  url: string;
  children?: React.ReactNode;
  urlCode: string;
}

const ListboxComponent: React.FC<ListboxComponentProps> = React.memo(
  ({ chapters, chapter, title, children, url,urlCode }) => {
    const [currentChapterIndex, setCurrentChapterIndex] = useState<
      number | null
    >(null);
    const chapterNumber = chapter.replace("chapter-", "");

    const [selectedOption, setSelectedOption] = useState<string>(chapterNumber);

    useEffect(() => {
      if (chapters) {
        setSelectedOption(chapter);
        setCurrentChapterIndex(chapters.findIndex((ch) => ch == chapterNumber));
      }
    }, [chapters, chapter]);

    useEffect(() => {
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/addview", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ series: title, chapter: chapter }),
          });
        } catch (error) {
          console.error("Error adding view:", error);
        }
      }, 10000);

      return () => clearTimeout(timer);
    }, [title, chapter]);

    setTimeout(() => {
      const timestamp = new Date().toISOString();
      const cookieName = "seriesHistory";

      let seriesHistory = [];

      if (hasCookie(cookieName)) {
        const compressedData = getCookie(cookieName) as string;
        seriesHistory = decompressData(compressedData);
      }
      const latestEntry = chapters[0];
      const newEntry = { title: url, chapter: Number(chapter.split("-")[1]), latest: latestEntry, timestamp };
      const updatedSeriesHistory = seriesHistory.filter(
        (entry: any) => entry.title !== title
      );

      updatedSeriesHistory.push(newEntry);

      const compressedHistory = compressData(updatedSeriesHistory);
      setCookie(cookieName, compressedHistory, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }, 5000);

    const renderNavigationButton = (direction: "prev" | "next") => {
      const isDisabled =
        direction === "prev"
          ? currentChapterIndex === chapters.length - 1
          : currentChapterIndex === 0;
      const targetIndex =
        direction === "prev"
          ? currentChapterIndex! + 1
          : currentChapterIndex! - 1;

      return (
        <button disabled={isDisabled}>
          <Link
            className={`px-4 py-2 font-bold rounded-full shadow-lg focus:shadow-outline-blue focus:outline-none ${
              isDisabled
                ? "bg-gray-400 pointer-events-none"
                : "bg-accent-500 hover:bg-accent-400"
            }`}
            aria-disabled={isDisabled}
            href={
              isDisabled
                ? "#"
                : `/series/${url}-${urlCode}/chapter-${chapters[targetIndex]}`
            }
            prefetch={true}
          >
            {direction === "prev" ? "Previous" : "Next"}
          </Link>
        </button>
      );
    };

    const renderChapterSelect = () => (
      <CustomSelectWithLink
        chapters={chapters}
        selectedOption={selectedOption}
        title={url}
      />
    );


    return (
      <div>
        <div className="max-w-3xl mx-auto pb-2">
          <div className="flex items-center justify-between pb-4 pt-2">
            {renderNavigationButton("prev")}
            {renderNavigationButton("next")}
          </div>
          <div>{renderChapterSelect()}</div>
        </div>
        {children}
        <div className="max-w-3xl mx-auto pt-2">
          <div>{renderChapterSelect()}</div>
          <div className="flex items-center justify-between pb-2 pt-4">
            {renderNavigationButton("prev")}
            {renderNavigationButton("next")}
          </div>
        </div>
      </div>
    );
  }
);

ListboxComponent.displayName = "ListboxComponent";

export default ListboxComponent;
