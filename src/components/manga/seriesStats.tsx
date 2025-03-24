import React from 'react';
import { Star, Users, BookOpen, Clock } from 'lucide-react';

interface SeriesStatsProps {
  data: {
    averageRating?: number;
    total_views?: number;
    total_chapters?: number;
    updated_at?: string;
    today_views?: number;
  };
}

const SeriesStats: React.FC<SeriesStatsProps> = ({ data }) => {
  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center p-2 rounded-lg bg-background-700/50">
        <div className="flex items-center mb-1">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          <span className="text-text-200 text-sm">Rating</span>
        </div>
        <span className="text-text-50 font-semibold">
          {data.averageRating ? data.averageRating.toFixed(1) : 'N/A'}
        </span>
      </div>
      
      <div className="flex flex-col items-center p-2 rounded-lg bg-background-700/50">
        <div className="flex items-center mb-1">
          <Users className="w-4 h-4 text-primary-400 mr-1" />
          <span className="text-text-200 text-sm">Views</span>
        </div>
        <span className="text-text-50 font-semibold">
          {formatNumber(data.total_views)}
        </span>
      </div>
      
      <div className="flex flex-col items-center p-2 rounded-lg bg-background-700/50">
        <div className="flex items-center mb-1">
          <BookOpen className="w-4 h-4 text-secondary-400 mr-1" />
          <span className="text-text-200 text-sm">Chapters</span>
        </div>
        <span className="text-text-50 font-semibold">
          {data.total_chapters || 0}
        </span>
      </div>
      
      <div className="flex flex-col items-center p-2 rounded-lg bg-background-700/50">
        <div className="flex items-center mb-1">
          <Clock className="w-4 h-4 text-accent-400 mr-1" />
          <span className="text-text-200 text-sm">Updated</span>
        </div>
        <span className="text-text-50 font-semibold text-xs">
          {formatDate(data.updated_at)}
        </span>
      </div>
      
      {data.today_views !== undefined && data.today_views > 0 && (
        <div className="col-span-2 mt-2 text-center">
          <span className="text-xs text-text-300">
            <span className="text-primary-400 font-semibold">{formatNumber(data.today_views)}</span> views today
          </span>
        </div>
      )}
    </div>
  );
};

export default SeriesStats;