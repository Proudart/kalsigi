
import { ScrollBar } from "../../../components/ui/scroll-area";
import { ScrollArea } from "../../../components/ui/scroll-area";
import Image from "next/image";
import { Link } from "../../../components/link";
import BookmarkButton from "../bookmarked";
import {  BookOpen, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
const SeriesImage = ({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className="w-full h-[200px] object-cover rounded-md aspect-2/3"
    loading="lazy"
    blurDataURL={`${src}&w=16&q=1`}
  />
);


  function formatDistanceToNow(date: Date) {
    const diff = Date.now() - date.getTime();
    const years = Math.floor(diff / 31536000000);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let result = "now";
    if (years > 0) result = `${years}yr`;
    else if (months > 0) result = `${months}mo`;
    else if (days > 0) result = `${days}d`;
    else if (hours > 0) result = `${hours}h`;
    else if (minutes > 0) result = `${minutes}m`;


    return result;
  }

  
const ContinueContent = ({ data }: { data: any[] }) => {
  return (
    <section className="space-y-6" data-testid="continue-reading">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Continue Reading
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300" data-testid="continue-badge">
            {data.length} series
          </span>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {data.map((serie, index) => (
              <div key={serie.url + index} className="w-[160px] md:w-[180px] group">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <Link href={`/series/${serie.url}-${serie.url_code}`} prefetch={true}>
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <SeriesImage src={serie.cover_image_url} alt={serie.title} width={180} height={240} />
                      </div>
                      {new Date().getTime() - new Date(serie.updated_at).getTime() < 24 * 60 * 60 * 1000 && (
                        <div className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Updated
                        </div>
                      )}
                    </Link>
                    <BookmarkButton seriesUrl={serie.url} />
                  </div>
                  
                  <div className="space-y-2">
                    <Link href={`/series/${serie.url}-${serie.url_code}/${serie.chapters[0].publisher.toLowerCase().replace(/\s+/g, '-')}/chapter-${serie.chapters[0].chapter_number}`} prefetch={true}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">
                            Ch. {serie.chapters[0].chapter_number}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(serie.chapters[0].updated_at))}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    </section>
  );
};

export default ContinueContent;