"use client";

import React, { useState, useEffect } from "react";
import { Link } from "../link";
import { Search } from "lucide-react";

interface ChapterType {
  update_time: string;
  chapter_number: number | string;
  publisher: string;
  published_at: string;
}

const ChapterSearch: React.FC<{ 
  data: { chapters: ChapterType[] }; 
  title: string;
}> = ({ data, title, }) => {
  const [searchResults, setSearchResults] = useState<ChapterType[]>(data.chapters);
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

          

  return (
    <div className="mx-auto py-8">
      <div className="relative mb-8"> 
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-400 h-5 w-5" />
          <input
            type="search"
            placeholder="Search chapter (e.g., 6, chapter-6)"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 font-sans text-base 
                     bg-background-600
                     border border-background-700
                     rounded-lg shadow-sm transition-all duration-300
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     text-text-50
                     placeholder:text-text-300"
          />
        </div>    
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[32rem] overflow-y-auto">
        {searchResults.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-text-300">
              No chapters found
            </p>
          </div>
        ) : (
          searchResults.map((chapter, index) => (
            <Link
              key={`${chapter.chapter_number}-${index}`}
              href={`/series/${title}/${chapter.publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${chapter.chapter_number}`}
              prefetch={true}
              className="group relative"
            >
              <div className="h-full p-6 
                          bg-background-600
                          rounded-lg
                          border border-background-700
                          transform transition-all duration-300
                          hover:scale-105 hover:shadow-lg
                          group-hover:border-primary-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">   
                    <h3 className="text-xl font-semibold tracking-tight 
                                 text-text-50">
                      Chapter {chapter.chapter_number}
                    </h3>
                    {/\b(hours?|minutes?|seconds?)\b/i.test(chapter.update_time) && (
                      <span className="inline-flex items-center rounded-full 
                             px-3 py-1.5 text-sm
                             bg-primary-500
                             text-primary-200">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text-300">
                      {chapter.publisher}
                    </p>
                    <time className="text-sm text-text-300">
                      {chapter.update_time}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterSearch;