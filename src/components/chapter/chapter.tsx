'use client';

// src/components/chapter/chapter.tsx
import { useState, useEffect, lazy } from "react";
import { Link } from "../../components/link";
import GenerateTags from "./generateTags";
import { useTheme } from 'next-themes';
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Share2, 
  Eye, 
  BookOpen, 
  ArrowUp 
} from "lucide-react";

// Lazy-loaded components for better performance
const ChapterNavigation = lazy(() => import("./chapterNav"));
const ChapterContent = lazy(() => import("./chapterContent"));
const ChapterChat = lazy(() => import("./chapterChat"));
const ShareMenu = lazy(() => import("../share"));
const Recommended = lazy(() => import("../recommendations"));

export default function Chapter({ params }: any) {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [chapterData, setChapterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPanel, setCurrentPanel] = useState(0);

  const title = params.series;
  const chapter = params.chapter;
  const chapterNumber = chapter.replace(/^chapter-/i, "");
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");

  // Add scroll-to-top button functionality
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch chapter data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {

        const res = await fetch(
            `https://www.skaihua.com/api/chapter?series=${modifiedTitle}`
        );
        
        if (!res.ok) throw new Error("Failed to fetch chapter data");
        
        const data = await res.json();
        setChapterData(data);
      } catch (error) {
        console.error("Error fetching chapter data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [modifiedTitle]);

  // Handle loading state
  if (isLoading) {
    return <ChapterSkeleton />;
  }

  // Extract chapter-specific data
  const currentChapterData = chapterData?.chapters?.find(
    (item: { chapter_number: any }) => item.chapter_number == chapterNumber
  );

  const panels = currentChapterData?.content || [];
  const striked = currentChapterData?.striked || false;
  const chapterId = currentChapterData?.id || null;
  const publisher = currentChapterData?.publisher || null;
  const date = currentChapterData?.published_at || null;
  const summary = currentChapterData?.summary || null;
  const views = currentChapterData?.views || 0;

  // Preload adjacent chapters for faster navigation
  const chapters = chapterData?.chapters || [];
  const currentIndex = chapters.findIndex((item: any) => item.chapter_number == chapterNumber);
  const prevChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1]?.chapter_number : null;
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1]?.chapter_number : null;

  return (
    <>
      {/* Fixed header with navigation controls */}
      <header className="sticky top-0 z-30 bg-background-100/90 dark:bg-background-900/90 backdrop-blur-md border-b border-background-300 dark:border-background-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link 
              href={`/series/${title}`} 
              className="flex items-center text-text-900 dark:text-text-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              <span className="font-medium max-w-[150px] sm:max-w-xs truncate">{chapterData?.title}</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-text-600 dark:text-text-400 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              <span>{views.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {prevChapter && (
                <Link 
                  href={`/series/${title}/chapter-${prevChapter}`}
                  aria-label="Previous chapter"
                  className="p-2 rounded-full text-text-700 dark:text-text-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-background-200 dark:hover:bg-background-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
              
              <span className="text-sm font-medium">Ch. {chapterNumber}</span>
              
              {nextChapter && (
                <Link 
                  href={`/series/${title}/chapter-${nextChapter}`}
                  aria-label="Next chapter"
                  className="p-2 rounded-full text-text-700 dark:text-text-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-background-200 dark:hover:bg-background-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="bg-background-50 dark:bg-background-950 min-h-screen pb-20">
        {/* Title Section */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap gap-x-2 text-sm text-text-600 dark:text-text-400">
              <li><Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
              <li>/</li>
              <li><Link href="/series" className="hover:text-primary-600 dark:hover:text-primary-400">Series</Link></li>
              <li>/</li>
              <li><Link href={`/series/${title}`} className="hover:text-primary-600 dark:hover:text-primary-400">{chapterData?.title}</Link></li>
              <li>/</li>
              <li className="text-text-900 dark:text-text-100 font-medium">{chapter}</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-text-950 dark:text-text-50 mb-4">
            {chapterData?.title} - {chapter?.toString().replace(/-/g, " ")}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center text-sm text-text-600 dark:text-text-400">
            <div className="flex items-center">
              <span className="mr-2">Published:</span> 
              <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{views.toLocaleString()} views</span>
            </div>
            <div className="flex-grow"></div>
            <button 
              onClick={() => document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1 p-2 rounded-lg bg-background-200 dark:bg-background-800 hover:bg-background-300 dark:hover:bg-background-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              onClick={() => document.getElementById('chapter-comments')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1 p-2 rounded-lg bg-background-200 dark:bg-background-800 hover:bg-background-300 dark:hover:bg-background-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </button>
          </div>
        </div>

        {/* Synopsis (if available) */}
        {summary?.synopsis && (
          <div className="max-w-3xl mx-auto px-4 mt-4 mb-6">
            <section className="bg-background-100 dark:bg-background-800 p-4 rounded-lg shadow-sm border border-background-200 dark:border-background-700" aria-label="Chapter Synopsis">
              <h2 className="text-lg font-semibold text-text-900 dark:text-text-100 mb-2">
                Synopsis
              </h2>
              <p className="text-text-700 dark:text-text-300 leading-relaxed">{summary.synopsis}</p>
            </section>
          </div>
        )}

        {/* Chapter navigation */}
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <ChapterNavigation
            chapters={chapters.map((item: any) => item.chapter_number)}
            title={chapterData?.title}
            currentChapter={chapterNumber}
            url={modifiedTitle}
            urlCode={chapterData?.url_code}
          />
        </div>

        {/* Chapter content */}
        <article className="max-w-3xl mx-auto px-4 mb-8">
          {striked ? (
            <div className="py-24 text-center bg-background-100 dark:bg-background-800 rounded-lg border border-background-200 dark:border-background-700">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-text-900 dark:text-text-100 mb-2">Content Removed</h3>
                <p className="text-text-700 dark:text-text-300">This chapter has been removed due to a complaint.</p>
              </div>
            </div>
          ) : (
            <ChapterContent 
              panels={panels} 
              title={chapterData?.title} 
              chapter={chapter}
              onPanelChange={setCurrentPanel}
            />
          )}
        </article>

        {/* Share section */}
        <div id="share-section" className="max-w-3xl mx-auto px-4 mb-8">
          <div className="bg-background-100 dark:bg-background-800 p-6 rounded-lg shadow-sm border border-background-200 dark:border-background-700">
            <h2 className="text-xl font-semibold text-text-900 dark:text-text-100 mb-4">Share this chapter</h2>
            <ShareMenu
              url={`https://www.${process.env.site_name}.com/series/${title}/${chapter}`}
              title={`${chapterData?.title} - ${chapter?.toString().replace(/-/g, " ")}`}
            />
          </div>
        </div>

        {/* Chapter summary (if available) */}
        {summary?.tldr && (
          <div className="max-w-3xl mx-auto px-4 mb-8">
            <section className="bg-background-100 dark:bg-background-800 p-6 rounded-lg shadow-sm border border-background-200 dark:border-background-700" aria-label="Chapter Summary">
              <h2 className="text-xl font-semibold text-text-900 dark:text-text-100 mb-2">
                Quick Summary
              </h2>
              <p className="text-text-700 dark:text-text-300 leading-relaxed">{summary.tldr}</p>
            </section>
          </div>
        )}

        {/* Chapter information tags */}
        <div className="max-w-3xl mx-auto px-4 mb-12">
          <GenerateTags
            summary={summary}
            title={chapterData?.title}
            chapter={chapter}
            datePublished={date}
            publisher={publisher}
          />
        </div>

        {/* Recommendations */}
        <div className="container mx-auto px-4 mb-12">
          <Recommended genres={chapterData?.genre} seriesId={chapterData?.id} />
        </div>

        {/* Comments section */}
        <div id="chapter-comments" className="container mx-auto px-4 mb-12">
          <ChapterChat chapterId={chapterId} />
        </div>

        {/* Scroll to top button */}
        {isScrolled && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors z-40"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </main>
    </>
  );
}

// Skeleton loader for better perceived performance
function ChapterSkeleton() {
  return (
    <div className="animate-pulse bg-background-50 dark:bg-background-950">
      <header className="sticky top-0 z-30 bg-background-100/90 dark:bg-background-900/90 backdrop-blur-md border-b border-background-300 dark:border-background-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-6 w-32 bg-background-200 dark:bg-background-800 rounded-md"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-background-200 dark:bg-background-800 rounded-full"></div>
            <div className="h-8 w-16 bg-background-200 dark:bg-background-800 rounded-md"></div>
            <div className="h-8 w-8 bg-background-200 dark:bg-background-800 rounded-full"></div>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="h-4 w-full max-w-md bg-background-200 dark:bg-background-800 rounded-md mb-6"></div>
        <div className="h-10 w-3/4 bg-background-200 dark:bg-background-800 rounded-md mb-6"></div>
        <div className="flex justify-between">
          <div className="h-6 w-32 bg-background-200 dark:bg-background-800 rounded-md"></div>
          <div className="h-6 w-32 bg-background-200 dark:bg-background-800 rounded-md"></div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 mb-6">
        <div className="h-12 w-full bg-background-200 dark:bg-background-800 rounded-md"></div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="h-96 bg-background-200 dark:bg-background-800 rounded-md mb-4"></div>
        <div className="h-96 bg-background-200 dark:bg-background-800 rounded-md mb-4"></div>
        <div className="h-96 bg-background-200 dark:bg-background-800 rounded-md"></div>
      </div>
    </div>
  );
}