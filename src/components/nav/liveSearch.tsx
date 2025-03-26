"use client";

import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { ScrollArea } from "../../components/ui/scroll-area";

const getSeries = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

interface SearchResult {
  url_code: any;
  title: string;
  url: string;
}

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Fetching data only if searchTerm is not empty
  const { data: searchResults = [] } = useSWR(
    searchTerm ? `/api/searchbar?query=${searchTerm}` : null,
    getSeries,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleExpandToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative bg-backgroundmain" ref={searchBoxRef}>
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 bg-pr"
        onClick={handleExpandToggle}
      >
        <IconSearch className="text-text-50 cursor-pointer" />
      </div>
      <input
        className="w-full pl-12 pr-3 py-2 rounded-md bg-background-800 text-primary-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
        onClick={handleExpandToggle}
      />

      {isExpanded && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background-500 border border-gray-300 rounded-md shadow-lg">
          <ScrollArea className="max-h-60">
            {searchResults.map(
              (result: SearchResult, index: React.Key | null | undefined) => (
                <Link
                  href={{ pathname: `/series/${result.url}-${result.url_code}` }}
                  key={index}
                  onClick={handleExpandToggle}
                  prefetch={true}
                >
                  <div className="px-3 py-2 cursor-pointer hover:text-text-950 text-text-50">
                    {result.title}
                  </div>
                </Link>
              )
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default SearchBox;