"use client";

import { Key, useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import Image from 'next/image';
import { setCookie, getCookie, hasCookie, deleteCookie } from "cookies-next";

interface SeriesData {
  url: string;
  title: string;
  cover_image_url: string;
}

const MyImage = ({ src, alt }: { src: string; alt: string }) => {
  return <Image src={`${src}`} alt={alt} width={200} height={300} />;
};

const getSeries = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function Series() {
  const [bookmarkedSeries, setBookmarkedSeries] = useState<string[]>([]);

  useEffect(() => {
    const fetchBookmarks = () => {
      const bookmarks = getCookie('bookmarks') as string;
      if (bookmarks) {
        setBookmarkedSeries(bookmarks.split(','));
      }
    };
    fetchBookmarks();
  }, []);
  
  const { data: seriesData, error, mutate } = useSWR(
    bookmarkedSeries ? `/api/bookmark?series=${bookmarkedSeries.join(',')}` : null, 
    getSeries
  );

  const handleRemoveBookmark = async (url: string) => {
    const newBookmarks = bookmarkedSeries.filter(series => series !== url);
    setBookmarkedSeries(newBookmarks);
    setCookie('bookmarks', newBookmarks.join(','), { 
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) 
    });

    try {
      const response = await fetch('/api/auth/removeBookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seriesUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Error removing bookmark');
      }

      // Update the data without triggering a full page reload
      mutate(seriesData?.filter((series: SeriesData) => series.url !== url), false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-background-100 min-h-screen space-y-12 flex-grow container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-text-800 mb-8">Bookmarks</h1>

      {error && <p className="text-red-500">no series bookmarked</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {seriesData ? (
          seriesData.map((series: SeriesData, index: Key | null | undefined) => (
            <div key={index} className="flex flex-col items-center p-4 border rounded-md shadow-md">
              <Link href={`/series/${series.url}`} className="mb-4" prefetch={true}>
                <MyImage src={series.cover_image_url} alt={series.title} />
              </Link>
              <Link href={`/series/${series.url}`} className="text-lg font-medium text-text-800 truncate w-full text-center" prefetch={true}>
                {series.title}
              </Link>
              <button
                onClick={() => handleRemoveBookmark(series.url)}
                className="mt-2 px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition-colors duration-300"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600"></p>
        )}
      </div>
    </div>
  );
}

export default Series;