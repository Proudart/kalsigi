'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Star } from 'lucide-react';
import { useMemo } from 'react';

interface RecommendedSeries {
  url_code: any;
  id: string;
  title: string;
  url: string;
  cover_image_url: string;
  description?: string;
  rating?: number;
  genres?: string[];
  total_chapters?: number;
  status?: 'Ongoing' | 'Completed' | 'Hiatus';
}

interface RecommendationsProps {
  genres: string[];
  seriesId: string;
  className?: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({ genres, seriesId, className }) => {
  const [recommendations, setRecommendations] = useState<RecommendedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<number>(5); // Default to 5 items
  const [isMounted, setIsMounted] = useState(false);
  const hasFetched = useRef(false);

  const normalizedGenres = genres?.filter(Boolean) || ['Random'];
  const normalizedSeriesId = seriesId || 'Random';

  // Function to calculate items per row based on screen width
  const getItemsPerRow = () => {
    if (typeof window === 'undefined') return 5; // Default for SSR
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3;  // md
    if (window.innerWidth >= 640) return 2;  // sm
    return 1; // mobile
  };

  // Function to adjust visible items
  const adjustVisibleItems = () => {
    if (!isMounted) return;
    
    const itemsPerRow = getItemsPerRow();
    const totalItems = recommendations.length;
    
    // If items don't fill more than one row, show all
    if (totalItems <= itemsPerRow) {
      setVisibleItems(totalItems);
      return;
    }
    
    // If items would create a partial second row, only show first row
    const rows = Math.ceil(totalItems / itemsPerRow);
    if (rows > 1 && (totalItems % itemsPerRow) !== 0) {
      setVisibleItems(itemsPerRow);
    } else {
      setVisibleItems(totalItems);
    }
  };

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle resize
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      adjustVisibleItems();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted, recommendations]);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (hasFetched.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/recommended?genres=${normalizedGenres.join(',')}&seriesId=${normalizedSeriesId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data);
        
        // After setting recommendations, adjust visible items
        setTimeout(adjustVisibleItems, 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoading(false);
        hasFetched.current = true;
      }
    };

    fetchRecommendations();
  }, [normalizedGenres, normalizedSeriesId]);

  // Adjust visible items when recommendations change
  useEffect(() => {
    if (isMounted && recommendations.length > 0) {
      adjustVisibleItems();
    }
  }, [isMounted, recommendations]);

  const SeriesCard = ({ series }: { series: RecommendedSeries }) => {
    const memoizedImage = useMemo(() => (
      <Image
        src={series.cover_image_url}
        alt={`Cover image for ${series.title}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={false}
      />
    ), [series.cover_image_url, series.title]);

    return (
      <Link 
        href={`/series/${series.url}-${series.url_code}`}
        className="group relative flex flex-col bg-background-100 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        prefetch={true}
      >
        <div className="relative aspect-4/5 overflow-hidden">
          {memoizedImage}
          <div className="absolute inset-0 bg-linear-to-t from-background-900/90 via-background-900/40 to-transparent" />
          
          {series.status && (
            <Badge className="absolute top-2 right-2 bg-primary-500">
              {series.status}
            </Badge>
          )}
          
          {series.rating && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-background-900/80 text-text-50 px-2 py-1 rounded-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{series.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2 grow">
          <h3 className="text-lg font-semibold line-clamp-2 text-text-900 group-hover:text-primary-600 transition-colors">
            {series.title}
          </h3>
          
          {series.description && (
            <p className="text-sm text-text-600 line-clamp-2">
              {series.description}
            </p>
          )}

          {series.genres && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {series.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {series.genres.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{series.genres.length - 3}
                </Badge>
              )}
            </div>
          )}

          {series.total_chapters && (
            <div className="text-sm text-text-500 mt-2">
              {series.total_chapters} chapters
            </div>
          )}
        </div>
      </Link>
    );
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4 bg-background-100 rounded-lg p-4">
      <Skeleton className="w-full aspect-2/3 rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>Failed to load recommendations: {error}</p>
      </div>
    );
  }

  const skeletonCount = getItemsPerRow();
  return (
    <section 
      className={`bg-primary-800 p-6 rounded-lg shadow-lg ${className || ''}`}
      aria-label="Similar Series Recommendations"
    >
      <h2 className="text-2xl font-bold mb-6 text-text-100">
        Similar Series You Might Enjoy
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          Array(skeletonCount).fill(null).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))
        ) : (
          recommendations.slice(0, visibleItems).map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))
        )}
      </div>

      {recommendations.length === 0 && !isLoading && (
        <p className="text-center text-text-600 py-8">
          No recommendations found. Try exploring different genres!
        </p>
      )}
    </section>
  );
};

export default Recommendations;