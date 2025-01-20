import React, { useState, useEffect } from 'react';

interface ReadingProgressProps {
    totalPages: number;
    currentPage: number;
    averageReadingSpeed?: number;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ totalPages, currentPage, averageReadingSpeed = 8 }) => {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            const newProgress = (currentPage / totalPages) * 100;
            setProgress(newProgress);

            if (timeLeft === 0) {
                const pagesLeft = totalPages - currentPage;
                const secondsLeft = pagesLeft * averageReadingSpeed;
                setTimeLeft(secondsLeft);
            }
        };

        calculateProgress();
    }, [currentPage, totalPages, averageReadingSpeed, timeLeft]);

    useEffect(() => {
        if (timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timeLeft]);

    const formatTimeLeft = (seconds: number) => {
        if (seconds < 60) return `${Math.ceil(seconds)}s`;
        const minutes = Math.ceil(seconds / 60);
        return `${minutes}m`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: 10 }}>
            <div className="bg-background-600 text-text-50 p-2" role="contentinfo" aria-label="Reading Progress">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm" aria-label={`Reading progress: ${Math.round(progress)} percent`}>
                            {Math.round(progress)}%
                        </span>
                        <div className="w-48 h-2 bg-background-600 rounded-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                            <div
                                className="h-full bg-primary-400 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                    <div className="text-sm" aria-label={`Time left: ${formatTimeLeft(timeLeft)}`}>
                        {formatTimeLeft(timeLeft)} left
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingProgress;