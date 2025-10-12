// app/series/[series]/[publisher]/[chapter]/page.tsx
import { Link } from "../../components/link";
import GenerateTags from "../../components/chapter/generateTags";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Share2, 
  Eye, 
  BookOpen, 
  ArrowUp 
} from "lucide-react";
import { Suspense } from "react";
import { lazyHydrate } from 'next-lazy-hydration-on-scroll';
import dynamic from "next/dynamic";
import { fetchChapterData, SeriesData } from "@/lib/api/chapter";

// Lazy-loaded components for better performance
const ChapterNavigation = dynamic(() => import("../../components/chapter/chapterNav"), { 
  ssr: true,
  loading: () => <div className="h-12 w-full bg-background-200 rounded-md animate-pulse"></div>,
});

const ChapterContent = dynamic(() => import("../../components/chapter/chapterContent"), { 
  ssr: true,
  loading: () => <div className="h-[60vh] animate-pulse bg-background-200 rounded-md"></div>,
});

const ChapterChat = dynamic(() => import("../../components/chapter/chapterChat"), { 
  ssr: true, 
  loading: () => <div className="h-64 bg-background-200 rounded-md animate-pulse"></div>,
});

const ShareMenu = dynamic(() => import("../../components/share"), { 
  ssr: true, 
  loading: () => <div className="h-12 bg-background-200 rounded-md animate-pulse"></div>,
});

const Recommended = dynamic(() => import("../../components/recommendations"), { 
  ssr: true, 
  loading: () => <div className="h-64 bg-background-200 rounded-md animate-pulse"></div>,
});

const ToDoAction = lazyHydrate(() => import("../../components/chapter/toDoActions"), { 
  wrapperElement: 'div' 
})

// Helper function to format publisher for URL
const formatPublisherForUrl = (publisher: string) => {
  return publisher.toLowerCase().replace(/\s+/g, '-');
};

interface ChapterProps {
  params: Promise<{ series: string; chapter: string; group: string }>;
  initialChapterData?: SeriesData | null;
  [key: string]: any;
}

export default async function Chapter({ params, initialChapterData }: ChapterProps) {
  const resolvedParams = await params;
  const title = resolvedParams.series;
  const chapter = resolvedParams.chapter;
  const publisher = resolvedParams.group;
  const chapterNumber = chapter.replace(/^chapter-/i, "");
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");

  // Fetch chapter data server-side
  const chapterData = initialChapterData ?? await fetchChapterData(modifiedTitle);

  // Find chapter from the specified publisher first, then fallback to any publisher
  let currentChapterData = chapterData?.chapters?.find(
    (item: any) => 
      item.chapter_number == chapterNumber && 
      formatPublisherForUrl(item.publisher || '') === publisher
  );

  // If not found with specified publisher, try any publisher
  if (!currentChapterData) {
    currentChapterData = chapterData?.chapters?.find(
      (item: { chapter_number: any, publisher: any }) => item.chapter_number == chapterNumber
    );
  }

  const panels = currentChapterData?.content || [];
  const striked = currentChapterData?.striked || false;
  const chapterId = currentChapterData?.id || null;
  const currentPublisher = currentChapterData?.publisher || null;
  const date = currentChapterData?.published_at || undefined;
  const summary = currentChapterData?.summary || undefined;
  const views = currentChapterData?.views || 0;

  // Helper function to find best publisher for a chapter
  const findBestPublisherForChapter = (chapterNum: string | number): string | null => {
    const chapterOptions = chapterData?.chapters?.filter(
      (item: any) => item.chapter_number == chapterNum
    ) || [];
    
    // Prefer current publisher if available
    const samePublisher = chapterOptions.find(
      (item: any) => formatPublisherForUrl(item.publisher || '') === publisher
    );
    
    if (samePublisher) {
      return formatPublisherForUrl(samePublisher.publisher || '');
    }
    
    // Otherwise return the first available publisher
    return chapterOptions.length > 0 ? formatPublisherForUrl(chapterOptions[0].publisher || '') : null;
  };

  // Find adjacent chapters for navigation with proper publisher handling
  const chapters = chapterData?.chapters || [];
  const uniqueChapters = Array.from(new Set(chapters.map((item: any) => String(item.chapter_number)))).sort((a: any, b: any) => Number(b) - Number(a)) as string[]; // Sort descending for manga
  
  const currentIndex = uniqueChapters.findIndex((num: string) => num === String(chapterNumber));
  const prevChapterNum = currentIndex < uniqueChapters.length - 1 ? uniqueChapters[currentIndex + 1] : null;
  const nextChapterNum = currentIndex > 0 ? uniqueChapters[currentIndex - 1] : null;
  
  const prevChapterPublisher = prevChapterNum ? findBestPublisherForChapter(prevChapterNum) : null;
  const nextChapterPublisher = nextChapterNum ? findBestPublisherForChapter(nextChapterNum) : null;

  return (
    <>
      {/* Fixed header with navigation controls */}
      <header className="sticky top-0 z-30 bg-background-100/90 backdrop-blur-md border-b border-background-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link 
              href={`/series/${title}`} 
              className="flex items-center text-text-900 hover:text-primary-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              <span className="font-medium max-w-[150px] sm:max-w-xs truncate">{chapterData?.title}</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-text-600">
              <Eye className="w-4 h-4 mr-1" />
              <span>{views.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {prevChapterNum && prevChapterPublisher && (
                <Link 
                  href={`/series/${title}/${prevChapterPublisher}/chapter-${prevChapterNum}`}
                  aria-label="Previous chapter"
                  className="p-2 rounded-full text-text-700 hover:text-primary-600 hover:bg-background-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
              
              <span className="text-sm font-medium">Ch. {chapterNumber}</span>
              
              {nextChapterNum && nextChapterPublisher && (
                <Link 
                  href={`/series/${title}/${nextChapterPublisher}/chapter-${nextChapterNum}`}
                  aria-label="Next chapter"
                  className="p-2 rounded-full text-text-700 hover:text-primary-600 hover:bg-background-200 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="bg-background-100 min-h-screen pb-20">
        {/* Title Section */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap gap-x-2 text-sm text-text-600 ">
              <li><Link href="/" className="hover:text-primary-600 ">Home</Link></li>
              <li>/</li>
              <li><Link href="/series" className="hover:text-primary-600 ">Series</Link></li>
              <li>/</li>
              <li><Link href={`/series/${title}`} className="hover:text-primary-600 ">{chapterData?.title}</Link></li>
              <li>/</li>
              <li className="text-text-900 font-medium">{chapter}</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-text-950 ">
            {chapterData?.title} - {chapter?.toString().replace(/-/g, " ")}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center text-sm text-text-600 ">
            {date && (
              <div className="flex items-center">
                <span className="mr-2">Published:</span>
                <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
              </div>
            )}
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{views.toLocaleString()} views</span>
            </div>
            <div className="flex-grow"> </div>
            <ToDoAction />
          </div>
        </div>

        {/* Synopsis (if available) */}
        {summary?.synopsis && (
          <div className="max-w-3xl mx-auto px-4 mt-4 mb-6">
            <section className="bg-background-100 p-4 rounded-lg shadow-sm border border-background-200" aria-label="Chapter Synopsis">
              <h2 className="text-lg font-semibold text-text-900 mb-2">
                Synopsis
              </h2>
              <p className="text-text-700 leading-relaxed">{summary.synopsis}</p>
            </section>
          </div>
        )}

        {/* Chapter navigation */}
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <Suspense fallback={<div className="h-12 w-full bg-background-200 rounded-md animate-pulse"></div>}>
            <ChapterNavigation
              chapters={chapters.map((item: any) => item.chapter_number)}
              title={chapterData?.title}
              currentChapter={chapterNumber}
              url={modifiedTitle}
              urlCode={chapterData?.url_code}
              publisher={publisher}
              chapterData={chapterData}
            />
          </Suspense>
        </div>

        {/* Chapter content */}
        <article className="max-w-3xl mx-auto mb-8">
          {striked ? (
            <div className="py-24 text-center bg-background-100 rounded-lg border border-background-200">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-text-900 mb-2">Content Removed</h3>
                <p className="text-text-700">This chapter has been removed due to a complaint.</p>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="h-96 bg-background-200 rounded-md animate-pulse"></div>}>
              <ChapterContent 
                panels={panels} 
                title={chapterData?.title} 
                chapter={chapter}
              />
            </Suspense>
          )}
        </article>

        {/* Share section */}
        <div id="share-section" className="max-w-3xl mx-auto px-4 mb-8">
          <div className="bg-background-800 p-6 rounded-lg shadow-sm border border-background-200">
            <h2 className="text-xl font-semibold text-text-100">Share this chapter</h2>
            <ShareMenu
              url={`https://www.manhwacall.com/series/${title}/${publisher}/${chapter}`}
              title={`${chapterData?.title} - ${chapter?.toString().replace(/-/g, " ")}`}
            />
          </div>
        </div>

        {/* Chapter summary (if available) */}
        {summary?.tldr && (
          <div className="max-w-3xl mx-auto px-4 mb-8">
            <section className="bg-background-100 p-6 rounded-lg shadow-sm border border-background-200" aria-label="Chapter Summary">
              <h2 className="text-xl font-semibold text-text-100">
                Quick Summary
              </h2>
              <p className="text-text-700 leading-relaxed">{summary.tldr}</p>
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
            publisher={currentPublisher}
          />
        </div>

        {/* Recommendations */}
        <div className="container mx-auto px-4 mb-12">
          <Suspense fallback={<div className="h-64 bg-background-200 rounded-md animate-pulse"></div>}>
            <Recommended
              genres={Array.isArray(chapterData?.genre) ? chapterData.genre : (chapterData?.genre ? [chapterData.genre] : [])}
              seriesId={chapterData?.id}
            />
          </Suspense>
        </div>

        {/* Comments section */}
        {chapterId && (
          <div id="chapter-comments" className="container mx-auto px-4 mb-12">
            <Suspense fallback={<div className="h-64 bg-background-200 rounded-md animate-pulse"></div>}>
              <ChapterChat chapterId={chapterId} />
            </Suspense>
          </div>
        )}
      </main>
    </>
  );
}

function sort(arg0: (a: any, b: any) => number) {
  throw new Error("Function not implemented.");
}
