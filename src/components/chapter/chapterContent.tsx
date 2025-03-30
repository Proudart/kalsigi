// src/components/chapter/chapterContent.tsx
"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import Image from "next/image";
import { 
  Layers, 
  Maximize, 
  Minimize, 
  Settings, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Monitor
} from "lucide-react";
import ChapterProgress from "./chapterProgress";
import { useTheme } from "next-themes";

// Reading mode types
type ReadingMode = "vertical" | "horizontal" | "webtoon";
type ImageQuality = "high" | "medium" | "low";

interface ChapterContentProps {
  panels: string[];
  title: string;
  chapter: string;
  onPanelChange: (index: number) => void;
}

// Memoized image component
const MangaPanel = memo(({
  src, 
  alt, 
  index, 
  mode, 
  quality,
  priority = false,
  onClick
}: {
  src: string;
  alt: string;
  index: number;
  mode: ReadingMode;
  quality: ImageQuality;
  priority?: boolean;
  onClick?: () => void;
}) => {
  // Quality settings
  const qualityMap = {
    high: 100,
    medium: 85,
    low: 70
  };
  
  const imageQuality = qualityMap[quality];
  
  // Loading priority - load first few images eagerly
  const loading = index <= 2 ? "eager" : "lazy";
  
  // Width varies by mode
  const width = mode === "horizontal" ? 800 : 1000;
  
  // Determine placeholder and size based on reading mode
  const placeholder = mode === "webtoon" ? "empty" : "blur";
  const blurDataURL = mode === "horizontal" 
    ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1200' fill='%23f0f0f0'%3E%3Crect width='800' height='1200' /%3E%3C/svg%3E"
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1500' fill='%23f0f0f0'%3E%3Crect width='1000' height='1500' /%3E%3C/svg%3E";

  // Use different sizing for different modes
  const sizing = mode === "horizontal"
    ? { height: "auto", maxHeight: "calc(100vh - 200px)" }
    : {};
  
  return (
    <div 
      className={`manga-panel relative ${
        mode === "horizontal" 
          ? "inline-flex items-center justify-center mx-auto" 
          : "w-full"
      }`}
      data-index={index}
      style={sizing}
    >
      <Image
        src={src}
        alt={`${alt} - Panel ${index + 1}`}
        width={width}
        height={1500}
        quality={imageQuality}
        loading={loading}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`
          ${mode === "horizontal" ? "max-h-[calc(100vh-200px)] w-auto" : "w-full h-auto"} 
          ${mode !== "webtoon" ? "shadow-md" : ""}
          ${mode === "vertical" ? "" : ""}
          rounded-md cursor-pointer transition-opacity
        `}
        onClick={onClick}
      />
    </div>
  );
});

MangaPanel.displayName = "MangaPanel";

// Settings modal component
const ReadingSettings = ({ 
  isOpen, 
  onClose, 
  currentMode, 
  onModeChange, 
  currentQuality, 
  onQualityChange,
  currentBackgroundTheme,
  onBackgroundChange
}: {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
  currentQuality: ImageQuality;
  onQualityChange: (quality: ImageQuality) => void;
  currentBackgroundTheme: string;
  onBackgroundChange: (theme: string) => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-background-100  rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-900 ">Reading Settings</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-background-200  text-text-500 hover:text-text-700   transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Reading mode */}
          <div>
            <h4 className="text-sm font-medium text-text-700  mb-2">Reading Mode</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onModeChange('vertical')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentMode === 'vertical'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Maximize className="w-5 h-5 mb-1" />
                <span className="text-xs">Vertical</span>
              </button>
              
              <button
                onClick={() => onModeChange('horizontal')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentMode === 'horizontal'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Minimize className="w-5 h-5 mb-1 transform rotate-90" />
                <span className="text-xs">Paged</span>
              </button>
              
              <button
                onClick={() => onModeChange('webtoon')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentMode === 'webtoon'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Layers className="w-5 h-5 mb-1" />
                <span className="text-xs">Webtoon</span>
              </button>
            </div>
          </div>
          
          {/* Image quality */}
          <div>
            <h4 className="text-sm font-medium text-text-700  mb-2">Image Quality</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onQualityChange('low')}
                className={`p-2 rounded-lg border transition-colors ${
                  currentQuality === 'low'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                Low
              </button>
              
              <button
                onClick={() => onQualityChange('medium')}
                className={`p-2 rounded-lg border transition-colors ${
                  currentQuality === 'medium'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                Medium
              </button>
              
              <button
                onClick={() => onQualityChange('high')}
                className={`p-2 rounded-lg border transition-colors ${
                  currentQuality === 'high'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                High
              </button>
            </div>
          </div>
          
          {/* Background theme */}
          <div>
            <h4 className="text-sm font-medium text-text-700  mb-2">Background Theme</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onBackgroundChange('light')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentBackgroundTheme === 'light'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Sun className="w-5 h-5 mb-1" />
                <span className="text-xs">Light</span>
              </button>
              
              <button
                onClick={() => onBackgroundChange('dark')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentBackgroundTheme === 'dark'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Moon className="w-5 h-5 mb-1" />
                <span className="text-xs">Dark</span>
              </button>
              
              <button
                onClick={() => onBackgroundChange('system')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  currentBackgroundTheme === 'system'
                    ? 'bg-primary-100  border-primary-300  text-primary-800 '
                    : 'border-background-300  hover:bg-background-200 '
                }`}
              >
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function ChapterContent({ panels, title, chapter, onPanelChange }: ChapterContentProps) {
  const [mode, setMode] = useState<ReadingMode>("vertical");
  const [quality, setQuality] = useState<ImageQuality>("high");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize based on stored preferences
  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem("readingMode") as ReadingMode;
    const savedQuality = localStorage.getItem("imageQuality") as ImageQuality;
    
    if (savedMode) setMode(savedMode);
    if (savedQuality) setQuality(savedQuality);
    
    // Hide navigation after scrolling
    const handleScroll = () => {
      setIsNavigationVisible(false);
      // Re-show after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setIsNavigationVisible(true);
      }, 3000);
      return () => clearTimeout(timeout);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Save preferences to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("readingMode", mode);
      localStorage.setItem("imageQuality", quality);
    }
  }, [mode, quality, isMounted]);
  
  // Intersection observer for tracking current panel
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Find entry with highest visibility ratio
        const mostVisibleEntry = visibleEntries.reduce(
          (prev, current) => 
            current.intersectionRatio > prev.intersectionRatio ? current : prev
        );
        
        const index = parseInt(
          mostVisibleEntry.target.getAttribute("data-index") || "0"
        );
        
        if (!isNaN(index)) {
          setCurrentIndex(index);
          onPanelChange(index);
        }
      }
    },
    [onPanelChange]
  );
  
  // Set up observer for vertical/webtoon mode
  useEffect(() => {
    if (mode === "vertical" || mode === "webtoon") {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: Array.from({ length: 11 }, (_, i) => i / 10), // 0 to 1.0
      };
      
      const observer = new IntersectionObserver(observerCallback, options);
      
      const elements = document.querySelectorAll(".manga-panel");
      elements.forEach(element => observer.observe(element));
      
      return () => {
        elements.forEach(element => observer.unobserve(element));
        observer.disconnect();
      };
    }
  }, [mode, panels.length, observerCallback]);
  
  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      contentRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  // Navigation for horizontal mode
  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "next" && currentIndex < panels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handleNavigate("prev");
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNavigate("next");
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);
  
  // Different rendering based on mode
  const renderContent = () => {
    switch (mode) {
      case "horizontal":
        return (
          <div className="flex flex-col items-center">
            <MangaPanel 
              src={panels[currentIndex]}
              alt={`${title} - ${chapter}`}
              index={currentIndex}
              mode={mode}
              quality={quality}
              priority={true}
              onClick={() => handleNavigate("next")}
            />
            
            <div className="flex justify-between items-center w-full mt-4 max-w-lg mx-auto">
              <button
                onClick={() => handleNavigate("prev")}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg bg-background-200  text-text-900  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous panel"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-sm font-medium">
                {currentIndex + 1} / {panels.length}
              </div>
              
              <button
                onClick={() => handleNavigate("next")}
                disabled={currentIndex === panels.length - 1}
                className="p-2 rounded-lg bg-background-200  text-text-900  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next panel"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
        
      case "webtoon":
        return (
          <div className="space-y-1">
            {panels.map((panel, index) => (
              <MangaPanel
                key={panel}
                src={panel}
                alt={`${title} - ${chapter}`}
                index={index}
                mode={mode}
                quality={quality}
                priority={index < 2}
                onClick={() => {
                  if (index < panels.length - 1) {
                    const nextPanel = document.querySelector(`[data-index="${index + 1}"]`);
                    nextPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            ))}
          </div>
        );
        
      case "vertical":
      default:
        return (
          <div className="space-y-4">
            {panels.map((panel, index) => (
              <MangaPanel
                key={panel}
                src={panel}
                alt={`${title} - ${chapter}`}
                index={index}
                mode={mode}
                quality={quality}
                priority={index < 2}
                onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              />
            ))}
          </div>
        );
    }
  };
  
  if (!isMounted) return null;
  
  return (
    <div 
      ref={contentRef}
      className={`relative bg-background-50  ${
        isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : ""
      }`}
    >
      {/* Floating controls */}
      <div 
        className={`fixed bottom-18 right-6 flex flex-col gap-3 transition-opacity duration-300 z-40 ${
          isNavigationVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
          aria-label="Reading settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Content */}
      <div className={`${mode === "horizontal" ? "flex justify-center items-center min-h-[70vh]" : ""}`}>
        {renderContent()}
      </div>
      
      {/* Reading progress indicator */}
      {(mode === "vertical" || mode === "webtoon") && (
        <ChapterProgress
          totalPages={panels.length}
          currentPage={currentIndex + 1}
          averageReadingSpeed={8}
        />
      )}
      
      {/* Settings modal */}
      <ReadingSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMode={mode}
        onModeChange={setMode}
        currentQuality={quality}
        onQualityChange={setQuality}
        currentBackgroundTheme={theme || 'system'}
        onBackgroundChange={setTheme}
      />
    </div>
  );
}