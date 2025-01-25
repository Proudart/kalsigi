import { useEffect, useRef, useState } from "react";
import { Link } from "../../components/link";
import { ArrowDown } from "lucide-react";

interface CustomSelectWithLinkProps {
  chapters: string[];
  selectedOption: string;
  title: string;
  urlCode: string;
}

const CustomSelectWithLink: React.FC<CustomSelectWithLinkProps> = ({
  chapters,
  selectedOption,
  title,
  urlCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      const container = dropdownRef.current;
      const selectedItem = selectedItemRef.current;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedItem.getBoundingClientRect();

        // Only adjust scroll if the selected item is outside the visible area
        if (
          selectedRect.top < containerRect.top ||
          selectedRect.bottom > containerRect.bottom
        ) {
          const scrollOffset =
            selectedItem.offsetTop -
            container.clientHeight / 2 +
            selectedItem.clientHeight / 2;
          container.scrollTop = Math.max(0, scrollOffset);
        }
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target === buttonRef.current ||
        buttonRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id="dropdownDefaultButton"
        onClick={handleButtonClick}
        className="w-full text-text-950 bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between"
        type="button"
        aria-expanded={isOpen}
      >
        {selectedOption}
        <ArrowDown
          size={18}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          id="dropdown"
          className="absolute left-0 right-0 z-50 w-full mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 max-h-64 overflow-y-auto overflow-x-hidden"
        >
          <ul
            className="py-2 text-sm text-text-950 bg-primary-500"
            aria-labelledby="dropdownDefaultButton"
          >
            {chapters.map((chapter, index) => (
              <li
                key={index}
                ref={chapter === selectedOption ? selectedItemRef : null}
              >
                <Link
                  href={`/series/${title}-${urlCode}/chapter-${chapter}`}
                  prefetch={true}
                  onClick={handleLinkClick}
                  className={`block px-4 py-2
                    ${
                      chapter === selectedOption
                        ? "bg-gray-600 font-medium"
                        : "visited:text-purple-600 hover:bg-gray-600"
                    }`}
                >
                  chapter-{chapter}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelectWithLink;
