import { useState } from "react";

type Props = {
  genres: string[];
  selectedGenres: string[];
  onChange: (selectedGenres: string[]) => void;
};

const GenreDropdown = ({ genres, selectedGenres, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleGenreClick = (genre: string) => {
    const index = selectedGenres.indexOf(genre);
    if (index === -1) {
      onChange([...selectedGenres, genre]);
    } else {
      onChange(selectedGenres.filter((g) => g !== genre));
    }
  };
  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-4 py-2 bg-secondary-100 border border-white rounded-lg cursor-pointer text-text-800"
      >
        <span className="mr-2">
          {selectedGenres.length > 0
            ? `${selectedGenres.length} selected`
            : "Select Genres"}
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 z-10 w-full py-1 overflow-y-auto rounded-lg shadow-lg top-full bg-secondary-300 ring-2 ring-secondary-700 max-h-48 mt-1 ">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`w-full text-left px-4 py-2  ${
                selectedGenres.includes(genre)
                  ? "bg-primarymain text-text-900 bg-background-500"
                  : "bg-secondary-300 text-text-900"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreDropdown;
