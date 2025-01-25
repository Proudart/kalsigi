"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { setCookie, getCookie } from "cookies-next";
import classNames from "classnames";

interface BookmarkProps {
  title: string;
}

const Bookmark: React.FC<BookmarkProps> = ({ title }) => {
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, '');

  const [rating, setRating] = useState<number>(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  const fetchWithErrorHandling = async (url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Fetch initial rating
  useEffect(() => {
    const fetchInitialRating = async () => {
      const kkt = getCookie("kkt") ? getCookie("kkt") + "" : "";
      if (!kkt) return;

      try {
        const response = await fetch(`/api/rate?seriesUrl=${modifiedTitle}&userId=${kkt}`);
        const data = await response.json();
        if (data && data.rating) {
          setRating(data.rating);
        }
      } catch (error) {
        console.error("Error fetching initial rating:", error);
      }
    };

    fetchInitialRating();
  }, [modifiedTitle]);

  const handleRating = useCallback(
    async (newRating: number) => {
      const kkt = getCookie("kkt") ? getCookie("kkt") + "" : "";
      if (!kkt) {
        // Handle case where user is not logged in
ssss        return;
      }

      try {
        await fetchWithErrorHandling("/api/rate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seriesUrl: modifiedTitle,
            rating: newRating,
            userId: kkt,
          }),
        });
        setRating(newRating);
      } catch (error) {
        console.error("Error setting rating:", error);
        // Optionally reset rating if the request failed
        // setRating(prevRating);
      }
    },
    [modifiedTitle]
  );

  useEffect(() => {
    const bookmarks = getCookie("bookmarks") ? getCookie("bookmarks") + "" : "";
    setBookmarked(bookmarks.split(",").includes(modifiedTitle));
  }, [modifiedTitle]);

  const handleBookmark = useCallback(async () => {
    const bookmarks = getCookie("bookmarks") ? getCookie("bookmarks") + "" : "";
    let bookmarksArray = bookmarks.split(",");
    const response = await fetch("/api/auth/getCurrentUser");
    const data = await response.json();
    if (bookmarksArray.includes(modifiedTitle) ) {
      bookmarksArray = bookmarksArray.filter((item) => item !== modifiedTitle);
      if (data && data.name) {
      await fetchWithErrorHandling("/api/auth/removeBookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesUrl: modifiedTitle,
        }),
      });
    }
    } else {
      bookmarksArray.push(modifiedTitle);
      if (data && data.name) {
        await fetchWithErrorHandling("/api/auth/addBookmark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seriesUrl: modifiedTitle,
          }),
        });
      }
      
    }

    setCookie("bookmarks", bookmarksArray.join(","), {
      maxAge: 365 * 24 * 60 * 60,
    });
    setBookmarked(bookmarksArray.includes(modifiedTitle));
  }, [modifiedTitle]);

  const bookmarkButtonClass = useMemo(
    () =>
      classNames("px-6 py-2 font-semibold rounded-sm transition duration-150", {
        "bg-accent-400 hover:bg-blue-600": bookmarked,
        "bg-gray-200 hover:bg-gray-300 text-gray-800": !bookmarked,
      }),
    [bookmarked]
  );

  return (
    <div className="flex items-center space-x-4">
      <button
        className={bookmarkButtonClass}
        onClick={handleBookmark}
        aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
      >
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-text-900 text-center">
          Rating
        </h2>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              className={`cursor-pointer text-2xl ${
                rating >= star ? "text-accent-400" : "text-gray-400"
              }`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              &#9733;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookmark;
