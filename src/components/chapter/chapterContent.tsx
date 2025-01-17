"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ChapterProgress from "../chapter/chapterProgress";

const ScrollableImage = dynamic(() => import("./scrollableImage"), {
  ssr: true,
});

const ModeSelector = dynamic(() => import("./modeSelector"), {
  ssr: true,
}) as React.ComponentType<{
  currentMode: string;
  onModeChange: (newMode: string) => void;
}>;

type ReadingMode = "scroll" | "single" | "double";

interface ChapterContentProps {
  panels: string[];
  title: string;
  chapter: string;
}

interface ImageProps {
  src: string;
  alt: string;
  index: number;
  mode: string;
  totalImages: number;
  currentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
}

const MyImage = ({
  src,
  alt,
  index,
  mode,
  totalImages,
  currentIndex,
  onNavigate,
}: ImageProps) => (
  <ScrollableImage
    unoptimized
    src={src}
    alt={alt}
    quality={100}
    width={1000}
    height={800}
    loading={index <= 3 ? "eager" : "lazy"}
    priority={index <= 3}
    placeholder="blur"
    blurDataURL={`https://image.kadkomi.com/process_image?url=${src}&width=${1}&height=${1}&quality=1&blur=true`}
    mode={mode}
    totalImages={totalImages}
    currentIndex={currentIndex}
    onNavigate={onNavigate}
    key={src}
  />
);

const ReadingTracker = ({
  panels,
  onPanelChange,
}: {
  panels: string[];
  onPanelChange: (index: number) => void;
}) => {
  const observerCallback = useCallback(
    (entries: any[]) => {
      const visibleEntries = entries.filter(
        (entry: { isIntersecting: any }) => entry.isIntersecting
      );
      if (visibleEntries.length > 0) {
        // Find the entry that takes up the most space in the viewport
        const mostVisibleEntry = visibleEntries.reduce(
          (
            prev: { intersectionRatio: number },
            current: { intersectionRatio: number }
          ) => {
            return current.intersectionRatio > prev.intersectionRatio
              ? current
              : prev;
          }
        );

        const index = parseInt(
          mostVisibleEntry.target.getAttribute("data-index")
        );
        if (!isNaN(index)) {
          onPanelChange(index);
        }
      }
    },
    [onPanelChange]
  );

  useEffect(() => {
    const options = {
      root: null, // Use viewport
      rootMargin: "0px",
      threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Create thresholds from 0 to 1
    };

    const observer = new IntersectionObserver(observerCallback, options);

    // Observe all panels
    const elements = document.querySelectorAll(".manga-panel");
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [panels.length, observerCallback]);

  return null;
};

export default function ChapterContent({ panels,title,chapter }: ChapterContentProps) {
  const [mode, setMode] = useState<ReadingMode>("scroll");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);

  const handlePanelChange = useCallback((index: number) => {
    setCurrentPanel(index);
  }, []);
  useEffect(() => {
    setIsClient(true);
    const savedMode = localStorage.getItem("readingMode") as ReadingMode;
    if (savedMode) setMode(savedMode);
  }, []);

  const handleModeChange = (newMode: string) => {
    setMode(newMode as ReadingMode);
    setCurrentIndex(0);
    localStorage.setItem("readingMode", newMode);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "next" && currentIndex < panels.length - 1) {
      setCurrentIndex(currentIndex + (mode === "double" ? 2 : 1));
    }
  };

  if (!isClient) return null;

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
      </div>
      <div className="max-w-2xl mx-auto">
        {mode === "scroll" ? (
          <>
            <ReadingTracker panels={panels} onPanelChange={handlePanelChange} />
            <div>
              {panels.map((panel, index) => (
                <div key={panel} className="manga-panel" data-index={index}>
                  <MyImage
                    src={panel}
                    alt={`${title} - ${chapter} - Panel ${index + 1}`}
                    index={index}
                    mode={mode}
                    totalImages={panels.length}
                    currentIndex={index}
                    onNavigate={handleNavigate}
                  />
                </div>
              ))}
            </div>
            <ChapterProgress
              totalPages={panels.length}
              currentPage={currentPanel + 1}
              averageReadingSpeed={8}
            />
          </>
        ) : (
          mode === "single" && (
            <div className="flex flex-col items-center">
              <MyImage
                src={panels[currentIndex]}
                alt={`Panel ${currentIndex + 1}`}
                index={currentIndex}
                mode={mode}
                totalImages={panels.length}
                currentIndex={currentIndex}
                onNavigate={handleNavigate}
              />
            </div>
          )
        )}
      </div>
    </>
  );
}
