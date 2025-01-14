import { useState } from "react";
import GenreDropdown from "./genresDropdown";
import {Link} from "../../components/link";


type Props = {
  genres: string[];
  statusOptions: string[];
  onFilter: (
    selectedGenres: string[],
    searchQuery: string,
    sorting: { sortBy: string; sortOrder: "asc" | "desc" },
    dateRange: { start: string; end: string },
    minRating: number,
    status: string[]
  ) => void;
};

const MangaGenreFilter = ({ genres, statusOptions, onFilter }: Props) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const handleGenreChange = (selectedGenres: string[]) => {
    setSelectedGenres(selectedGenres);
  };

  const handleApplyFilter = () => {
    onFilter(selectedGenres, searchQuery, { sortBy, sortOrder }, dateRange, minRating, selectedStatus);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as "asc" | "desc");
  };

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleMinRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinRating(Number(event.target.value));
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="p-5 mb-5 bg-secondary-200 rounded-xl shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-text-900">Filter Series</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-text-800">Genres</label>
          <GenreDropdown
            genres={genres}
            selectedGenres={selectedGenres}
            onChange={handleGenreChange}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-800">Search titles</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="w-full px-3 py-2 bg-background-100 border rounded-lg border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-900"
            placeholder="Enter title..."
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-text-800">Sort by</label>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="w-full px-3 py-2 bg-background-100 border rounded-lg border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-900"
            >
              <option value="title">Title</option>
              <option value="release_date">Release Date</option>
              <option value="last_update">Last Update</option>
              <option value="total_views">Total Views</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-text-800">Sort order</label>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="w-full px-3 py-2 bg-background-100 border rounded-lg border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-900"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-800">Date Range</label>
          <div className="flex space-x-4">
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="flex-1 px-3 py-2 bg-background-100 border rounded-lg border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-900"
            />
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="flex-1 px-3 py-2 bg-background-100 border rounded-lg border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-900"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-800">Minimum Rating</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            onChange={handleMinRatingChange}
            className="w-full"
          />
          <div className="text-center text-text-900">{minRating.toFixed(1)}</div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-text-800">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedStatus.includes(status)
                    ? 'bg-primary-600 text-text-50'
                    : 'bg-background-300 text-text-800 hover:bg-background-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 text-text-50 rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Apply Filter
          </button>

          <Link href="/series-list" prefetch={true}>
            <button className="px-4 py-2 text-text-50 rounded-lg cursor-pointer bg-secondary-600 hover:bg-secondary-700 transition-colors">
              Text Mode
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MangaGenreFilter;