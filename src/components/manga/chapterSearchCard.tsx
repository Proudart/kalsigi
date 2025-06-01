import React from 'react';
import { Link } from '../link';
import { Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChapterProps {
  chapter: {
    chapter_number: string;
    update_time?: string;
    published_at: string;
    striked?: boolean;
    publisher: string;
  };
  title: string;
  index: number;
}

function formatTimeAgo(timestamp: string): string {
  // Existing formatTimeAgo implementation...
  // (keeping the implementation as is)
  if (timestamp.includes('ago') || timestamp.includes('yr') || timestamp.includes('mo') || 
      timestamp.includes('d') || timestamp.includes('h') || timestamp.includes('m')) {
    return timestamp;
  }
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years}${years === 1 ? 'yr' : 'yrs'}`;
  if (months > 0) return `${months}${months === 1 ? 'mo' : 'mos'}`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'Just now';
}

function isNew(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days < 3;
}

const ChapterSearchCard: React.FC<ChapterProps> = ({ chapter, title, index }) => {
  const timeAgo = formatTimeAgo(chapter.update_time || chapter.published_at);
  const isNewChapter = isNew(chapter.published_at);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
    >
      <Link
        href={`/series/${title}/${chapter.publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${chapter.chapter_number}`}
        prefetch={true}
        className="block"
        aria-label={`Read chapter ${chapter.chapter_number}`}
      >
        <div className={`group relative flex items-center justify-between 
                        p-3 rounded-lg transition-all duration-200
                        ${chapter.striked 
                          ? 'bg-background-700/20 opacity-60' 
                          : 'bg-background-700/40 hover:bg-background-600 cursor-pointer'}
                        ${index % 2 === 0 ? 'bg-opacity-50' : 'bg-opacity-30'}
                        focus-within:ring-2 focus-within:ring-primary-500`}
                        tabIndex={0}
                        role="button"
                        aria-disabled={chapter.striked ? 'true' : 'false'}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded bg-background-600 text-text-200 font-medium">
              {chapter.chapter_number}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-text-50 font-medium">
                  Chapter {chapter.chapter_number}
                </span>
                
                {isNewChapter && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-primary-600 text-primary-50 rounded">
                    NEW
                  </span>
                )}
              </div>
              
              {chapter.publisher && (
                <span className="text-xs text-text-400">
                  {chapter.publisher}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-text-400">
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              <span>{timeAgo}</span>
            </div>
            
            <ArrowUpRight className="w-4 h-4 text-text-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
          
          {chapter.striked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background-900/30 rounded-lg">
              <span className="px-2 py-1 bg-background-800 text-text-300 text-xs rounded">
                Content removed
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ChapterSearchCard;