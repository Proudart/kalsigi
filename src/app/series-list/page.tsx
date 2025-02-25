"use client";

import {Link} from "../../components/link";
import React from "react";
import useSWR from "swr";
import { Separator } from "../../components/ui/separator";

const getSeries = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function Series() {
  const { data, isLoading } = useSWR(
    `api/search-all`,
    getSeries,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  if (isLoading) return <div>Error loading data.</div>;
  if (!data) return <div>Loading...</div>;

  // Group series by the first character
  const groupedSeries = data.reduce((acc: {[key: string]: any[]}, series: { title: string, url: string }) => {
    const firstChar = series.title[0].toUpperCase();
    acc[firstChar] = acc[firstChar] || [];
    acc[firstChar].push(series);
    return acc;
  }, {});

  return (
    <div className="mx-auto">
      <div className="flex flex-col items-center justify-center h-auto p-5 m-5 bg-secondary-700 rounded-xl">
        <h1 className="text-2xl font-bold text-center text-text-100">Series</h1>
      </div>
      <div className="flex flex-col justify-center h-auto p-5 m-5 bg-secondary-700 rounded-xl">
        <Link href="/series" prefetch={true}>
          <div className="mb-4 text-text-100 visited:text-blue-600">Go back to /series</div>
        </Link>
        {Object.entries(groupedSeries).map(([char, seriesList]: any) => (
          <div key={char}>
            <h2 className="pb-2 text-2xl font-bold text-text-100">{char}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {seriesList.map((series: any) => (
                <Link href={`/series/${series.url}`} key={series.url} className="text-text-100 visited:text-blue-600" prefetch={true}>
                  <div>{series.title}</div>
                </Link>
              ))}
            </div>
            <Separator className="bg-text-50 mb-2 mt=2"/>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Series;