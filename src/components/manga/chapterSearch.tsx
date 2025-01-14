"use client";

import React, { useState, useEffect } from "react";
import { Link } from "../link";

interface ChapterType {
  update_time: string;
  chapter_number: number | string;
  publisher: string;
  published_at: string;
}

const ChapterSearch: React.FC<{ 
  data: { chapters: ChapterType[] }; 
  title: string;
}> = ({ data, title }) => {
  const [searchResults, setSearchResults] = useState<ChapterType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(data.chapters);
      return;
    }

    const normalizedQuery = query.replace(/^chapter-?/i, '').trim();

    const filteredChapters = data.chapters.filter((chapter) => {
      const chapterNum = String(chapter.chapter_number);
      return chapterNum.includes(normalizedQuery) || 
             `chapter-${chapterNum}`.toLowerCase().includes(query) ||
             `chapter ${chapterNum}`.toLowerCase().includes(query);
    });

    setSearchResults(filteredChapters);
  };

  useEffect(() => {
    if (data?.chapters) {
      setSearchResults(data.chapters);
    }
  }, [data]);

  return (
    <div className="mx-auto">
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search chapter (e.g., 6, chapter-6, or Chapter 6)"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-3 py-1.5 font-normal text-text-700 bg-input border 
                   border-solid border-border rounded transition ease-in-out 
                   focus:text-text-900 focus:bg-primarymain focus:border-primary.foreground 
                   focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-96">
        {searchResults.length === 0 ? (
          <div className="col-span-full text-center py-4">
            <p className="text-text-700">No chapters found</p>
          </div>
        ) : (
          searchResults.map((chapter, index) => (
            <div
              key={`${chapter.chapter_number}-${index}`}
              className="transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <Link
                className="block p-4 bg-primary-500 text-text-950 rounded-lg shadow 
                         hover:shadow-lg transition-shadow duration-300"
                href={`/series/${title}/chapter-${chapter.chapter_number}`}
                prefetch={true}
              >
                <div className="text-center">
                  <p className="text-lg font-bold mb-1">
                    Chapter {chapter.chapter_number}
                  </p>
                  <div className="flex flex-col text-sm">
                    <span className="opacity-75">{chapter.publisher}</span>
                    <span className="opacity-75">{chapter.update_time}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterSearch;