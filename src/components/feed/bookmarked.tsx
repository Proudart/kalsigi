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

// BookmarkButton Component
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
          relative inline-flex items-center
          p-2 rounded-lg transition-all duration-300 ease-in-out
          ${isBookmarked 
            ? 'bg-primary-100 hover:bg-primary-200' 
            : 'bg-gray-800/80 hover:bg-gray-700/80'}
          shadow-sm hover:shadow-md
          ${isShaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}
          hover:scale-105
        `}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-5 h-5 text-primary-600" />
        ) : (
          <Bookmark className="w-5 h-5 text-white/80 hover:text-white" />
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
