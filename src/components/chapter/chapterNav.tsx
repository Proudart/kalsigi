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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  
  // Update current index when chapters or current chapter changes
  useEffect(() => {
    if (chapters) {
      const index = chapters.findIndex(ch => ch === currentChapter);
      setCurrentIndex(index);
    }
  }, [chapters, currentChapter]);
  
  // Track reading history
  useEffect(() => {
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
        latest: Number(latestEntry), 
        timestamp,
      };

      const updatedHistory = seriesHistory.filter(
        (entry: any) => entry.title !== url
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

  // Apply scroll to the dropdown after it's opened
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current && selectedItemRef.current) {
      // Wait for the dropdown to render completely
      requestAnimationFrame(() => {
        if (!dropdownRef.current || !selectedItemRef.current) return;
        
        const container = dropdownRef.current;
        const selectedItem = selectedItemRef.current;
        
        // Calculate position to center the selected item
        const containerHeight = container.clientHeight;
        const itemHeight = selectedItem.clientHeight;
        const itemTop = selectedItem.offsetTop;
        
        // Center the item in the visible area of the dropdown
        container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
      });
    }
  }, [isDropdownOpen]);

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  // Close dropdown when clicking outside (excludes the dropdown toggle button)
  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking the toggle button
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Close if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isDropdownOpen]);

  // Navigation actions
  const isPrevDisabled = currentIndex === chapters.length - 1;
  const isNextDisabled = currentIndex === 0;
  const prevChapterNumber = !isPrevDisabled ? chapters[currentIndex + 1] : null;
  const nextChapterNumber = !isNextDisabled ? chapters[currentIndex - 1] : null;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-background-200">
      {/* Top navigation */}
      <div className="grid grid-cols-3 bg-background-800">
        <Link
          href={isPrevDisabled ? "#" : `/series/${url}-${urlCode}/chapter-${prevChapterNumber}`}
          aria-disabled={isPrevDisabled}
          className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
            isPrevDisabled 
              ? "text-text-500 cursor-not-allowed" 
              : "text-text-100 hover:bg-background-200 hover:text-text-800"
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Link>
        
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="flex items-center justify-center py-3 px-4 text-text-100 hover:bg-background-200 hover:text-text-800 transition-colors"
          aria-expanded={isDropdownOpen}
          aria-controls="chapter-dropdown"
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
              ? "text-text-500 cursor-not-allowed" 
              : "text-text-100 hover:bg-background-200 hover:text-text-800"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {/* Chapter dropdown - position it absolutely so it doesn't affect page layout */}
      {isDropdownOpen && (
        <div
          id="chapter-dropdown"
          ref={dropdownRef}
          className="max-h-64 overflow-y-auto border-t border-background-200 bg-background-800 relative"
        >
          <ul className="py-1">
            {chapters.map((chapterNum) => (
              <li
                key={chapterNum}
                ref={chapterNum === currentChapter ? selectedItemRef : null}
                className={`${
                  chapterNum === currentChapter
                    ? "bg-primary-100"
                    : ""
                }`}
              >
                <Link
                  href={`/series/${url}-${urlCode}/chapter-${chapterNum}`}
                  prefetch={Math.abs(parseInt(chapterNum) - parseInt(currentChapter)) <= 2}
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm hover:bg-background-200 hover:text-text-800 transition-colors ${
                    chapterNum === currentChapter
                      ? "font-medium text-primary-700"
                      : "text-text-100"
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