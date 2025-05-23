"use client";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useDebounce } from "use-debounce";

const getSeries = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
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
  
  // Debounce search term to reduce API calls
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  
  // Fetching data only if debouncedSearchTerm is not empty
  const { data: searchResults = [], isValidating } = useSWR(
    debouncedSearchTerm ? `/api/searchbar?query=${debouncedSearchTerm}` : null,
    getSeries,
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 60000,
      keepPreviousData: true // This keeps previous data while fetching new data
    }
  );

  // Memoize the results to prevent unnecessary re-renders
  const memoizedResults = useMemo(() => searchResults, [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    const handleScroll = () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    // Close on click outside
    document.addEventListener("mousedown", handleClickOutside);
    // Close on scroll
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isExpanded]);

  const handleExpandToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const handleLinkClick = useCallback(() => {
    setIsExpanded(false);
    setSearchTerm(""); // Optionally clear search after selection
  }, []);

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
      
      {/* Smooth transition wrapper */}
      <div
        className={`fixed sm:absolute left-4 right-4 sm:left-0 sm:right-auto sm:w-full top-[60px] sm:top-full mt-1 bg-background-500 border border-gray-300 rounded-md shadow-lg z-50 transition-all duration-200 ${
          isExpanded && memoizedResults.length > 0
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-2 pointer-events-none"
        }`}
      >
        <ScrollArea className="max-h-60">
          {/* Loading indicator */}
          {isValidating && debouncedSearchTerm && (
            <div className="px-3 py-2 text-text-50 opacity-70">
              Searching...
            </div>
          )}
          
          {/* Results with stable keys */}
          {!isValidating && memoizedResults.map((result: SearchResult) => (
            <Link
              href={{
                pathname: `/series/${result.url}-${result.url_code}`,
              }}
              key={`${result.url_code}-${result.url}`} // More stable key
              onClick={handleLinkClick}
              prefetch={true}
            >
              <div className="px-3 py-2 cursor-pointer hover:bg-background-600 hover:text-text-950 text-text-50 transition-colors duration-150">
                {result.title}
              </div>
            </Link>
          ))}
          
          {/* No results message */}
          {!isValidating && debouncedSearchTerm && memoizedResults.length === 0 && (
            <div className="px-3 py-2 text-text-50 opacity-70">
              No results found
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default SearchBox;