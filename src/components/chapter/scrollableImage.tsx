"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";

interface ScrollableImageProps extends ImageProps {
  mode: string;
  totalImages: number;
  currentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
}

const ScrollableImage: React.FC<ScrollableImageProps> = (props) => {
  const { mode, totalImages, currentIndex, onNavigate, ...imageProps } = props;
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIndex]);

  if (!mounted) {
    return null;
  }

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (mode === "scroll") {
      const scrollHeight = window.innerHeight * 0.75;
      window.scrollBy({ top: scrollHeight, behavior: "smooth" });
    } 
    else if (mode === "single") {
      const screenWidth = window.innerWidth;
      const clickPosition = event.clientX;
      const halfScreenWidth = screenWidth / 2;

      if (clickPosition > halfScreenWidth) {
        onNavigate("next");
      } else {
        onNavigate("prev");
      }
    }
  };

  const containerClasses = {
    scroll: "w-full",
    single: "max-w-2xl mx-auto",
    double: "w-1/2 inline-block",
  };

  const buttonClass = `px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm
    bg-primary-600 text-background-50 hover:bg-primary-700
    disabled:bg-background-300 disabled:text-text-500
      
     
    focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50`;

  return (
    <div ref={imageRef} className={`image-container ${containerClasses[mode as keyof typeof containerClasses]} `}>
      <div className="relative">
        <Image
          {...imageProps}
          alt={imageProps.alt || `Chapter page ${currentIndex + 1}`}
          unoptimized
          onClick={handleImageClick}
          className={`cursor-pointer shadow-md ${imageProps.className || ""}`}
        />
      </div>
      {mode !== "scroll" && (
        <div className="mt-4 flex justify-between items-center bg-background-100  p-4 rounded-lg shadow-md">
          <button
            onClick={() => onNavigate("prev")}
            disabled={currentIndex === 0}
            className={buttonClass}
            aria-label="Previous image"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-text-700 ">
            {`${currentIndex + 1} / ${totalImages}`}
          </span>
          <button
            onClick={() => onNavigate("next")}
            disabled={currentIndex === totalImages - 1}
            className={buttonClass}
            aria-label="Next image"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrollableImage;