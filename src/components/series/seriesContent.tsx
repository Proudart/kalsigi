"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MangaGenreFilter from "../../components/series/mangaGenreFilter";
import Image from "next/image";
import {Link} from "../../components/link";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import useSWR from "swr";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "../../components/ui/pagination";

const getSeries = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const MyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={300}
      className="object-cover w-full rounded-xl"
      priority={true}
    />
  );
};

const mangaGenre = [
  "Fantasy",
  "Webtoons",
  "Shounen",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Romance",
  "Supernatural",
  "Seinen",
  "Martial Arts",
  "Sci-fi",
  "Historical",
  "Mystery",
  "School Life",
  "Shoujo",
  "Harem",
  "Slice of Life",
  "Psychological",
  "Shoujo Ai",
  "Josei",
  "Sports",
  "Adult",
  "Gender Bender",
  "Mecha",
  "Yaoi",
  "Tragedy",
  "Horror",
  "Smut",
  "One Shot",
  "Mature",
  "Ecchi",
  "Shounen Ai",
  "Doujinshi",
];

const statusOptions = ["Ongoing", "Completed", "Hiatus"];

function SeriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [totalSeries, setTotalSeries] = useState<number>(0);
  const seriesPerPage = 15;

  const getParamValue = (key: string, defaultValue: string = "") => {
    return searchParams?.get(key) || defaultValue;
  };

  const page = parseInt(getParamValue("page", "1"), 10);
  const selectedGenres = getParamValue("genres").split(",").filter(Boolean);
  const searchQuery = getParamValue("search");
  const sortBy = getParamValue("sortBy", "title");
  const sortOrder = getParamValue("sortOrder", "asc") as "asc" | "desc";
  const dateStart = getParamValue("dateStart");
  const dateEnd = getParamValue("dateEnd");
  const minRating = parseFloat(getParamValue("minRating", "0"));
  const status = getParamValue("status").split(",").filter(Boolean);
  const totalPages = Math.ceil(totalSeries / seriesPerPage);

  const { data, isLoading } = useSWR(
    `/api/search?offset=${
      (page - 1) * seriesPerPage
    }&search=${searchQuery}&genres=${selectedGenres.join(
      ","
    )}&sortBy=${sortBy}&sortOrder=${sortOrder}&minRating=${minRating}&status=${status.join(
      ","
    )}`,
    getSeries
  );

  useEffect(() => {
    if (data) {
      setTotalSeries(data[0][0].count);
    }
  }, [data]);

  const handleFilter = (
    selectedGenres: string[],
    searchQuery: string,
    sorting: { sortBy: string; sortOrder: "asc" | "desc" },
    dateRange: { start: string; end: string },
    minRating: number,
    status: string[]
  ) => {
    const params = new URLSearchParams({
      page: "1",
      genres: selectedGenres.join(","),
      search: searchQuery,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
      dateStart: dateRange.start,
      dateEnd: dateRange.end,
      minRating: minRating.toString(),
      status: status.join(","),
    });
    router.push(`/series?${params.toString()}`);
  };

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set(
      "page",
      Math.max(
        1,
        Math.min(pageNumber, Math.ceil(totalSeries / seriesPerPage))
      ).toString()
    );
    return `/series?${params.toString()}`;
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (page <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (page + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = page - Math.floor(maxPagesToShow / 2);
        endPage = page + Math.floor(maxPagesToShow / 2);
      }
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href={createPageUrl(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink href={createPageUrl(i)} isActive={i === page}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href={createPageUrl(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="bg-background-100 min-h-screen space-y-12 grow container mx-auto px-4 py-8">
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-center h-auto p-5 mb-4 bg-background-200 rounded-xl">
          <h1 className="text-2xl font-bold text-center text-text-900">
            Series
          </h1>
        </div>

        <div className="flex-col items-center justify-center mx-auto">
          <MangaGenreFilter
            genres={mangaGenre}
            statusOptions={statusOptions}
            onFilter={handleFilter}
          />
        </div>

        {isLoading ? (
          <div className="text-text-900 text-center py-8">Loading...</div>
        ) : (
          <div>
            <div className="justify-center my-4 sm:flex">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={createPageUrl(page - 1)}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      href={createPageUrl(page + 1)}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {data &&
                data[1]?.map((series: any) => (
                  <div
                    className="transition duration-300 ease-in-out bg-primary-100 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105"
                    key={series.title}
                  >
                    <Link href={"/series/" + series.url + '-' + series.url_code} className="block">
                      <AspectRatio.Root
                        ratio={9 / 12}
                        className="overflow-hidden rounded-md"
                      >
                        <MyImage src={series.cover_image_url} alt={series.title} />
                      </AspectRatio.Root>
                      <h2 className="mt-2 text-lg font-semibold text-text-900 truncate">
                        {series.title}
                      </h2>
                    </Link>
                  </div>
                ))}
            </div>
            <div className="justify-center my-4 sm:flex">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={createPageUrl(page - 1)}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      href={createPageUrl(page + 1)}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesContent;