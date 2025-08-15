'use client';

import { Clock, BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useEffect, useCallback, memo } from 'react';
import { getCookie, setCookie } from 'cookies-next';

type Manga = {
  title: string;
  url: string;
  cover_image_url: string;
  url_code: string;
  chapters: [{
    chapter_number: string;
    published_at: string;
  }];
};

import React from 'react';

const BookmarkButton = React.memo(function BookmarkButton({ seriesUrl }: { seriesUrl: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const bookmarks = getCookie('bookmarks') ? getCookie('bookmarks') + "" : "";
    setIsBookmarked(bookmarks.split(',').includes(seriesUrl));
  }, [seriesUrl]);

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    try {
      const bookmarks = getCookie('bookmarks') ? getCookie('bookmarks') + "" : "";
      let bookmarksArray = bookmarks.split(',');

      const response = await fetch('/api/auth/getCurrentUser');
      const data = await response.json();

      if (isBookmarked) {
        bookmarksArray = bookmarksArray.filter(bookmark => bookmark !== seriesUrl);
        
        if (data && data.name) {
          const response = await fetch('/api/auth/removeBookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seriesUrl }),
          });
          if (!response.ok) throw new Error('Failed to remove bookmark');
        }
      } else {
        bookmarksArray.push(seriesUrl);
        
        if (data && data.name) {
          const response = await fetch('/api/auth/addBookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seriesUrl }),
          });
          if (!response.ok) throw new Error('Failed to add bookmark');
        }
      }

      setCookie('bookmarks', bookmarksArray.join(','), {
        maxAge: 365 * 24 * 60 * 60,
      });
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  }, [isBookmarked, seriesUrl]);

  return (
    <div className="absolute top-2 left-2 z-50">
      <button
        onClick={handleBookmark}
        className={`
          relative inline-flex items-center justify-center
          w-8 h-8 rounded-full transition-all duration-200 ease-in-out
          ${isBookmarked 
            ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30' 
            : 'bg-gray-900/80 hover:bg-gray-900/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90'}
          shadow-sm hover:shadow-md
          ${isShaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}
          hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          min-h-[44px] min-w-[44px]
        `}
        aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        aria-pressed={isBookmarked}
        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bookmark className="w-4 h-4 text-white/90" />
        )}
      </button>
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
});

export default BookmarkButton;