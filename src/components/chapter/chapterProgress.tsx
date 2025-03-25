// src/components/chapter/chapterProgress.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ChapterProgressProps {
  totalPages: number;
  currentPage: number;
  averageReadingSpeed?: number; // seconds per panel
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({ 
  totalPages, 
  currentPage, 
  averageReadingSpeed = 8 
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate progress percentage and remaining time
  useEffect(() => {
    const calculateProgress = () => {
      const newProgress = (currentPage / totalPages) * 100;
      setProgress(newProgress);

      const pagesLeft = totalPages - currentPage;
      const secondsLeft = pagesLeft * averageReadingSpeed;
      setTimeLeft(secondsLeft);
    };

    calculateProgress();
  }, [currentPage, totalPages, averageReadingSpeed]);

  // Timer to countdown remaining time
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => Math.max(0, prevTimeLeft - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  // Auto-hide progress bar after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setIsVisible(true);
      hideTimer();
    };

    let hideTimerId: number | NodeJS.Timeout;
    
    const hideTimer = () => {
      clearTimeout(hideTimerId);
      hideTimerId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('scroll', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initial hide timer
    hideTimer();

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearTimeout(hideTimerId);
    };
  }, []);

  // Format time left in minutes and seconds
  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Complete';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 transition-opacity duration-300 z-30 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Reading Progress"
    >
      <div className="bg-background-800/90 backdrop-blur-sm text-text-50 p-2 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="text-sm">
            {currentPage} / {totalPages}
          </div>
          
          <div className="flex-1 mx-4">
            <div className="w-full h-2 bg-background-600 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
          
          <div className="flex items-center text-sm whitespace-nowrap">
            <Clock className="w-4 h-4 mr-1 text-primary-400" />
            <span aria-label={`Time left: ${formatTimeLeft(timeLeft)}`}>
              {formatTimeLeft(timeLeft)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterProgress;