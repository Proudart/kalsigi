// src/components/chapter/chapterNav.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "../link";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from "lucide-react";
import { setCookie, getCookie, hasCookie } from "cookies-next";
import pako from "pako";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

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

// Helper function to format publisher for URL
const formatPublisherForUrl = (publisher: string) => {
  return publisher.toLowerCase().replace(/\s+/g, '-');
};

interface ChapterNavigationProps {
  chapters: string[];
  title: string;
  currentChapter: string;
  url: string;
  urlCode: string;
  publisher: string;
  chapterData: any;
}

export default function ChapterNavigation({
  chapters,
  title,
  currentChapter,
  url,
  urlCode,
  publisher,
  chapterData
}: ChapterNavigationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [publisherSelections, setPublisherSelections] = useState<Record<string, boolean>>({});
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Helper function to find best publisher for a chapter
  const findBestPublisherForChapter = (chapterNum: string) => {
    const chapterOptions = chapterData?.chapters?.filter(
      (item: any) => item.chapter_number == chapterNum
    ) || [];
    
    // Prefer current publisher if available
    const samePublisher = chapterOptions.find(
      (item: any) => formatPublisherForUrl(item.publisher || '') === publisher
    );
    
    if (samePublisher) {
      return formatPublisherForUrl(samePublisher.publisher);
    }
    
    // Otherwise return the first available publisher
    return chapterOptions.length > 0 ? formatPublisherForUrl(chapterOptions[0].publisher) : publisher;
  };

  // Get available publishers for a chapter
  const getPublishersForChapter = (chapterNum: string) => {
    const chapterOptions = chapterData?.chapters?.filter(
      (item: any) => item.chapter_number == chapterNum
    ) || [];
    
    return chapterOptions.map((item: any) => ({
      publisher: item.publisher || 'Unknown',
      formattedPublisher: formatPublisherForUrl(item.publisher || 'unknown')
    }));
  };

  // Check if chapter has multiple publishers
  const hasMultiplePublishers = (chapterNum: string) => {
    return getPublishersForChapter(chapterNum).length > 1;
  };

  // Toggle publisher selection for a chapter
  const togglePublisherSelection = (chapterNum: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPublisherSelections(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  // Get unique chapters and sort them
  const uniqueChapters = Array.from(new Set(chapters)).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  
  // Update current index when chapters or current chapter changes
  useEffect(() => {
    if (uniqueChapters) {
      const index = uniqueChapters.findIndex(ch => ch === currentChapter);
      setCurrentIndex(index);
    }
  }, [uniqueChapters, currentChapter]);
  
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

      const latestEntry = uniqueChapters[0];
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
  }, [title, currentChapter, uniqueChapters, url]);

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

  // Apply scroll to the modal content after it's opened
  useEffect(() => {
    if (isModalOpen && selectedItemRef.current && scrollContainerRef.current) {
      // Wait for the modal to render completely and animations to finish
      const scrollTimer = setTimeout(() => {
        if (!selectedItemRef.current || !scrollContainerRef.current) return;

        // Calculate the position to scroll to
        const container = scrollContainerRef.current;
        const selectedItem = selectedItemRef.current;

        const containerHeight = container.clientHeight;
        const scrollTop = selectedItem.offsetTop - (containerHeight / 2) + (selectedItem.clientHeight / 2);

        // Scroll the container to center the selected item
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }, 150);

      return () => clearTimeout(scrollTimer);
    }
  }, [isModalOpen]);

  // Close modal handler
  const closeModal = () => {
    setIsModalOpen(false);
    setPublisherSelections({});
  };

  // Navigation actions with publisher handling
  const isPrevDisabled = currentIndex === uniqueChapters.length - 1;
  const isNextDisabled = currentIndex === 0;
  const prevChapterNumber = !isPrevDisabled ? uniqueChapters[currentIndex + 1] : null;
  const nextChapterNumber = !isNextDisabled ? uniqueChapters[currentIndex - 1] : null;

  const prevChapterPublisher = prevChapterNumber ? findBestPublisherForChapter(prevChapterNumber) : null;
  const nextChapterPublisher = nextChapterNumber ? findBestPublisherForChapter(nextChapterNumber) : null;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-background-200">
      {/* Top navigation */}
      <div className="grid grid-cols-3 bg-background-800">
        <Link
          href={isPrevDisabled ? "#" : `/series/${url}-${urlCode}/${prevChapterPublisher}/chapter-${prevChapterNumber}`}
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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center py-3 px-4 text-text-100 hover:bg-background-200 hover:text-text-800 transition-colors "
            >
              Chapter {currentChapter}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] rounded-xl">
            <DialogHeader>
              <DialogTitle>Select Chapter</DialogTitle>
            </DialogHeader>

            {/* Chapter list in modal */}
            <div ref={scrollContainerRef} className="overflow-y-auto max-h-[60vh] mt-4">
              <ul className="space-y-1">
                {uniqueChapters.map((chapterNum) => {
                  const chapterPublisher = findBestPublisherForChapter(chapterNum);
                  const availablePublishers = getPublishersForChapter(chapterNum);
                  const showPublisherSelection = publisherSelections[chapterNum] && hasMultiplePublishers(chapterNum);

                  return (
                    <li
                      key={chapterNum}
                      ref={chapterNum === currentChapter ? selectedItemRef : null}
                      className="rounded-md"
                      
                    >
                      <div className="flex items-center rounded-xl bg-primary-600">
                        <Link
                          href={`/series/${url}-${urlCode}/${chapterPublisher}/chapter-${chapterNum}`}
                          prefetch={Math.abs(parseInt(chapterNum) - parseInt(currentChapter)) <= 2}
                          onClick={closeModal}
                          className={`flex-1 block px-4 py-3 text-sm rounded-md transition-colors ${
                            chapterNum === currentChapter
                              ? "font-semibold bg-primary-600 dark:bg-primary-500 text-white dark:text-white hover:bg-primary-700 dark:hover:bg-primary-600"
                              : "text-text-900 dark:text-text-100 hover:bg-background-100 dark:hover:bg-background-700"
                          }`} 
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">Chapter {chapterNum}</div>
                            <div className={`text-xs ${
                              chapterNum === currentChapter
                                ? "text-white/80 dark:text-white/80"
                                : "text-text-500 dark:text-text-400"
                            }`}>
                              {availablePublishers.find((p: { formattedPublisher: string; }) => p.formattedPublisher === chapterPublisher)?.publisher || chapterPublisher}
                            </div>
                          </div>
                        </Link>

                        {/* Publisher selection button - only show if multiple publishers exist */}
                        {hasMultiplePublishers(chapterNum) && (
                          <button
                            onClick={(e) => togglePublisherSelection(chapterNum, e)}
                            className="p-2 text-text-400 hover:text-text-900 dark:hover:text-text-100 hover:bg-background-100 dark:hover:bg-background-700 rounded-md transition-colors"
                            title="Choose publisher"
                          >
                            <ChevronRightIcon className={`w-4 h-4 transform transition-transform duration-200 ${
                              showPublisherSelection ? "rotate-90" : ""
                            }`} />
                          </button>
                        )}
                      </div>

                      {/* Publisher options */}
                      {showPublisherSelection && (
                        <div className="bg-background-50 dark:bg-background-800 border-t border-background-200 dark:border-background-600 rounded-b-md mt-1">
                          {availablePublishers.map((pub: { formattedPublisher: string; publisher: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                            <Link
                              key={`${chapterNum}-${pub.formattedPublisher}`}
                              href={`/series/${url}-${urlCode}/${pub.formattedPublisher}/chapter-${chapterNum}`}
                              onClick={closeModal}
                              className={`block px-8 py-2 text-sm transition-colors hover:bg-background-200 dark:hover:bg-background-700 rounded-md ${
                                pub.formattedPublisher === chapterPublisher
                                  ? "text-primary-600 dark:text-primary-400 font-medium"
                                  : "text-text-700 dark:text-text-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{pub.publisher}</span>
                                {pub.formattedPublisher === chapterPublisher && (
                                  <span className="text-xs text-primary-500 dark:text-primary-400">(current)</span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </DialogContent>
        </Dialog>

        <Link
          href={isNextDisabled ? "#" : `/series/${url}-${urlCode}/${nextChapterPublisher}/chapter-${nextChapterNumber}`}
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
    </div>
  );
}