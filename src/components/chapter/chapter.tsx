// src/components/chapter/chapter.tsx
import { Link } from "../../components/link";
import GenerateTags from "./generateTags";
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



// Lazy-loaded components for better performance
const ChapterNavigation = dynamic(() => import("./chapterNav"), { 
  ssr: true,
  loading: () => <div className="h-12 w-full bg-background-200 rounded-md animate-pulse"></div>,
});

const ChapterContent = dynamic(() => import("./chapterContent"), { 
  ssr: true,
  loading: () => <div className="h-[60vh] animate-pulse bg-background-200 rounded-md"></div>,
});

const ChapterChat = dynamic(() => import("./chapterChat"), { 
  ssr: true, 
  loading: () => <div className="h-64 bg-background-200 rounded-md animate-pulse"></div>,
});

const ShareMenu = dynamic(() => import("../share"), { 
  ssr: true, 
  loading: () => <div className="h-12 bg-background-200 rounded-md animate-pulse"></div>,
});

const Recommended = dynamic(() => import("../recommendations"), { 
  ssr: true, 
  loading: () => <div className="h-64 bg-background-200 rounded-md animate-pulse"></div>,
});

const ToDoAction = lazyHydrate(() => import("./toDoActions"), { 
  wrapperElement: 'div' 
});

// Client-side components

async function fetchChapterData(modifiedTitle: any) {
  try {
    const res = await fetch(
      `https://www.manhwacall.com/api/chapter?series=${modifiedTitle}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) throw new Error("Failed to fetch chapter data");
    
    return res.json();
  } catch (error) {
    console.error("Error fetching chapter data:", error);
    throw error;
  }
}

export default async function Chapter({ params }: any) {
  const title = params.series;
  const chapter = params.chapter;
  const chapterNumber = chapter.replace(/^chapter-/i, "");
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");

  // Fetch chapter data server-side
  const chapterData = await fetchChapterData(modifiedTitle);

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

  // Find adjacent chapters for navigation
  const chapters = chapterData?.chapters || [];
  const currentIndex = chapters.findIndex((item: any) => item.chapter_number == chapterNumber);
  const prevChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1]?.chapter_number : null;
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1]?.chapter_number : null;

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
              {prevChapter && (
                <Link 
                  href={`/series/${title}/chapter-${prevChapter}`}
                  aria-label="Previous chapter"
                  className="p-2 rounded-full text-text-700 hover:text-primary-600 hover:bg-background-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
              
              <span className="text-sm font-medium">Ch. {chapterNumber}</span>
              
              {nextChapter && (
                <Link 
                  href={`/series/${title}/chapter-${nextChapter}`}
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
            <div className="flex items-center">
              <span className="mr-2">Published:</span> 
              <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
            </div>
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
              url={`https://www.${process.env.site_name}.com/series/${title}/${chapter}`}
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
            publisher={publisher}
          />
        </div>

        {/* Recommendations */}
        <div className="container mx-auto px-4 mb-12">
          <Suspense fallback={<div className="h-64 bg-background-200 rounded-md animate-pulse"></div>}>
            <Recommended genres={chapterData?.genre} seriesId={chapterData?.id} />
          </Suspense>
        </div>

        {/* Comments section */}
        <div id="chapter-comments" className="container mx-auto px-4 mb-12">
          <Suspense fallback={<div className="h-64 bg-background-200 rounded-md animate-pulse"></div>}>
            <ChapterChat chapterId={chapterId} />
          </Suspense>
        </div>


      </main>
    </>
  );
}
