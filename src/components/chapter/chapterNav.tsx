// src/components/chapter/chapterNavigation.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "../link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { setCookie, getCookie, hasCookie } from "cookies-next";
import pako from "pako";

// Helper functions for cookie compression
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

interface ChapterNavigationProps {
  chapters: string[];
  title: string;
  currentChapter: string;
  url: string;
  urlCode: string;
}

export default function ChapterNavigation({
  chapters,
  title,
  currentChapter,
  url,
  urlCode
}: ChapterNavigationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  
  useEffect(() => {
    if (chapters) {
      const index = chapters.findIndex(ch => ch === currentChapter);
      setCurrentIndex(index);
    }
  }, [chapters, currentChapter]);
  
  useEffect(() => {
    // Track reading history
    const trackReadingHistory = setTimeout(() => {
      const timestamp = new Date().toISOString();
      const cookieName = "seriesHistory";

      let seriesHistory = [];
      if (hasCookie(cookieName)) {
        const compressedData = getCookie(cookieName) as string;
        seriesHistory = decompressData(compressedData);
      }

      const latestEntry = chapters[0];
      const newEntry = { 
        title: url, 
        chapter: Number(currentChapter), 
        latest: latestEntry, 
        timestamp,
        coverImage: url ? `/covers/${url}.jpg` : null // Assuming cover images follow this pattern
      };

      const updatedHistory = seriesHistory.filter(
        (entry: any) => entry.title !== title
      );

      updatedHistory.unshift(newEntry); // Add to beginning of the array
      
      // Limit history to 50 entries to prevent cookie size issues
      if (updatedHistory.length > 50) {
        updatedHistory.pop();
      }

      const compressedHistory = compressData(updatedHistory);
      setCookie(cookieName, compressedHistory, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }, 5000);

    return () => clearTimeout(trackReadingHistory);
  }, [title, currentChapter, chapters, url]);

  // Add view count (with debounce)
  useEffect(() => {
    const addViewTimer = setTimeout(async () => {
      try {
        await fetch("/api/addview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ series: title, chapter: `chapter-${currentChapter}` }),
        });
      } catch (error) {
        console.error("Error adding view:", error);
      }
    }, 10000); // 10 second delay

    return () => clearTimeout(addViewTimer);
  }, [title, currentChapter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isDropdownOpen && selectedItemRef.current) {
      const container = dropdownRef.current;
      const selectedItem = selectedItemRef.current;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedItem.getBoundingClientRect();

        // Scroll to selected item if outside visible area
        if (
          selectedRect.top < containerRect.top ||
          selectedRect.bottom > containerRect.bottom
        ) {
          const scrollOffset =
            selectedItem.offsetTop -
            container.clientHeight / 2 +
            selectedItem.clientHeight / 2;
          container.scrollTop = Math.max(0, scrollOffset);
        }
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  // Navigation actions
  const isPrevDisabled = currentIndex === chapters.length - 1;
  const isNextDisabled = currentIndex === 0;
  const prevChapterNumber = !isPrevDisabled ? chapters[currentIndex + 1] : null;
  const nextChapterNumber = !isNextDisabled ? chapters[currentIndex - 1] : null;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-background-200 dark:border-background-700">
      {/* Top navigation */}
      <div className="grid grid-cols-3 bg-background-100 dark:bg-background-800">
        <Link
          href={isPrevDisabled ? "#" : `/series/${url}-${urlCode}/chapter-${prevChapterNumber}`}
          aria-disabled={isPrevDisabled}
          className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
            isPrevDisabled 
              ? "text-text-400 dark:text-text-600 cursor-not-allowed" 
              : "text-text-800 dark:text-text-200 hover:bg-background-200 dark:hover:bg-background-700"
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Link>
        
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center py-3 px-4 text-text-800 dark:text-text-200 hover:bg-background-200 dark:hover:bg-background-700 transition-colors"
        >
          Chapter {currentChapter}
          <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`} />
        </button>
        
        <Link
          href={isNextDisabled ? "#" : `/series/${url}-${urlCode}/chapter-${nextChapterNumber}`}
          aria-disabled={isNextDisabled}
          className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
            isNextDisabled 
              ? "text-text-400 dark:text-text-600 cursor-not-allowed" 
              : "text-text-800 dark:text-text-200 hover:bg-background-200 dark:hover:bg-background-700"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {/* Chapter dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="max-h-64 overflow-y-auto border-t border-background-200 dark:border-background-700 bg-background-50 dark:bg-background-900"
        >
          <ul className="py-1">
            {chapters.map((chapterNum, index) => (
              <li
                key={chapterNum}
                ref={chapterNum === currentChapter ? selectedItemRef : null}
                className={`${
                  chapterNum === currentChapter
                    ? "bg-primary-100 dark:bg-primary-900"
                    : ""
                }`}
              >
                <Link
                  href={`/series/${url}-${urlCode}/chapter-${chapterNum}`}
                  prefetch={Math.abs(parseInt(chapterNum) - parseInt(currentChapter)) <= 2}
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm hover:bg-background-200 dark:hover:bg-background-700 transition-colors ${
                    chapterNum === currentChapter
                      ? "font-medium text-primary-700 dark:text-primary-300"
                      : "text-text-700 dark:text-text-300"
                  }`}
                >
                  Chapter {chapterNum}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}