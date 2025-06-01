"use client";

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Bookmark, Clock, Users, BookOpen, Star, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import BookmarkButton from "../feed/bookmarked";
import ShareButton from "../share";
import { Button } from "../ui/button";
import { Link } from "../link";
import ChapterSearchCard from "./chapterSearchCard";
import Recommendations from "../recommendations";
import SeriesChat from "./seriesChat";
import dynamic from "next/dynamic";

// Lazy loaded components
const SeriesStats = dynamic(() => import("./seriesStats"), { ssr: true });

export default function EnhancedManga({ data, title }: { data: any; title: string }) {
  const [activeTab, setActiveTab] = useState("chapters");
  const [visibleChapters, setVisibleChapters] = useState(20);
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll events for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;      
      setIsSticky(offset > 350);
    };  

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load more chapters when scrolling
  const loadMoreChapters = () => {
    setVisibleChapters(prev => prev + 20);
  };

  return (
    <div className="bg-background-100 min-h-screen pb-16">


      {/* Hero Section with Cover Image */}
      <div className="relative w-full h-64 lg:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-900 z-0">
          <Image
            src={data.cover_image_url}
            alt={data.title}
            fill
            className="object-covesr opacity-40 blur-sm"
            priority
            sizes="100vw"
          />
        </div>
      </div>
      


      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-32 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cover and Info */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6">
            <div className="bg-background-800 rounded-xl overflow-hidden shadow-xl border border-background-700">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={data.cover_image_url}
                  alt={data.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute  z-10">
                  <BookmarkButton seriesUrl={data.url} />
                </div>
              </div>
              
              <div className="p-4 space-y-4">

                
                <SeriesStats data={data} />
                
                <div className="flex flex-wrap gap-2 mt-4" aria-label="Genres">
                  {data.genre?.filter((g: string) => g !== "Null").map((genre: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                    <Badge key={index} variant="outline" className="bg-primary-800/30 text-text-200 border-primary-700">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-background-800 rounded-xl p-4 shadow-lg border border-background-700">
              <h3 className="text-lg font-semibold mb-3 text-text-50">Share</h3>
              <ShareButton
                url={`https://www.manhwacall.com/series/${title}`}
                title={data.title}
              />
            </div>
          </div>

          {/* Right Column - Manga Details */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="bg-background-800 rounded-xl p-6 shadow-lg border border-background-700">
              <h1 className="text-2xl md:text-3xl font-bold text-text-50 mb-2">{data.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-text-300 text-sm mb-4">
                {data.author && (
                  <div className="flex items-center">
                    <span className="opacity-70 mr-2">Author:</span> 
                    <span className="text-text-50">{data.author}</span>
                  </div>
                )}
                {data.artist && (
                  <div className="flex items-center">
                    <span className="opacity-70 mr-2">Artist:</span> 
                    <span className="text-text-50">{data.artist}</span>
                  </div>
                )}
                {data.status && (
                  <div className="flex items-center">
                    <span className="opacity-70 mr-2">Status:</span> 
                    <span className="text-text-50">{data.status}</span>
                  </div>
                )}
                {data.publisher && (
                  <div className="flex items-center">
                    <span className="opacity-70 mr-2">Publisher:</span> 
                    <span className="text-text-50">{data.publisher}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-text-100 mb-3">Synopsis</h3>
                <p className="text-text-300 leading-relaxed">
                  {data.description || "No description available for this series."}
                </p>
              </div>
            </div>
            
            {/* Chapters & Info Tabs */}
            <div id="chapters-section" className="bg-background-800 rounded-xl shadow-lg border border-background-700 overflow-hidden">
              <Tabs defaultValue="chapters" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-background-700 text-text-100 ">
                  <TabsTrigger value="chapters" className="flex-1 py-3">
                    <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" /> 
                    Chapters ({data.chapters?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="flex-1 py-3">
                    <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" /> 
                    Discussion
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chapters" className="p-0">
                  <div className="p-4 bg-background-700/30 flex justify-between items-center flex-wrap">
                  <h3 className="text-lg font-semibold text-text-50">Latest Chapters</h3>
                  <div className="flex gap-2">
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-background-600 border-background-500 hover:bg-background-500"
                    disabled={data.chapters?.length === 0}
                    asChild
                    aria-label={`Read first chapter ${data.chapters && data.chapters.length > 0 ? data.chapters[data.chapters.length - 1].chapter_number : ''}`}
                    >
                    <Link 
                      href={data.chapters && data.chapters.length > 0 
                      ? `/series/${title}/${data.chapters[data.chapters.length - 1].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${data.chapters[data.chapters.length - 1].chapter_number}`
                      : '#'
                      }
                      prefetch={true}
                    >
                      First Chapter
                    </Link>
                    </Button>
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-background-600 border-background-500 hover:bg-background-500"
                    disabled={data.chapters?.length === 0}
                    asChild
                    aria-label={`Read latest chapter ${data.chapters && data.chapters.length > 0 ? data.chapters[0].chapter_number : ''}`}
                    >
                    <Link 
                      href={data.chapters && data.chapters.length > 0 
                      ? `/series/${title}/${data.chapters[0].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${data.chapters[0].chapter_number}`
                      : '#'
                      }
                      prefetch={true}
                    >
                      Latest Chapter
                    </Link>
                    </Button>
                  </div>
                  </div>
                  
                  <ScrollArea className="h-[500px] p-4">
                  <div className="space-y-2">
                    {data.chapters
                    ?.slice(0, visibleChapters)
                    .map((chapter: { chapter_number: any; update_time?: string | undefined; published_at?: string; striked?: boolean | undefined; publisher?: string | undefined; }, index: number) => (
                      <ChapterSearchCard 
                      key={chapter.chapter_number} 
                      chapter={{
                        ...chapter,
                        chapter_number: String(chapter.chapter_number),
                        published_at: chapter.published_at || new Date().toISOString(),
                        publisher: chapter.publisher || 'Unknown'
                      }} 
                      title={title}
                      index={index} 
                      />
                    ))}
                    
                    {data.chapters?.length > visibleChapters && (
                    <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={loadMoreChapters}
                            className="bg-background-600 hover:bg-background-500 text-text-100"
                            aria-label={`Load ${Math.min(20, data.chapters.length - visibleChapters)} more chapters`}
                          >
                            Load More
                          </Button>
                        </div>
                      )}
                      
                      {(!data.chapters || data.chapters.length === 0) && (
                        <div className="py-10 text-center text-text-300">
                          <p>No chapters available for this series.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="discussion" className="p-4">
                  <SeriesChat seriesId={data.id} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Recommendations Section */}
            <div className="mt-8">
              <Recommendations genres={data.genre} seriesId={data.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}