
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
  width: any;
  height: any;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="object-cover w-full aspect-2/3"
      loading="lazy"
      blurDataURL={`${src}&w=16&q=1`}
    />
  );
};

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
    <div>
      <section>
        <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
            <div className="flex w-max space-x-4 p-4">
              {data.map((serie, index) => (
                <div key={serie.url + index} className="w-[150px] space-y-3">
                  <div className="relative overflow-hidden rounded-lg">
                    <Link href={`/series/${serie.url}-${serie.url_code}`} prefetch={true}>
                      <SeriesImage src={serie.cover_image_url} alt={serie.title} width={150} height={200} />
                        {new Date().getTime() - new Date(serie.updated_at).getTime() < 24 * 60 * 60 * 1000 && (
                        <Badge className="absolute top-2 right-2 bg-accent-500 text-text-50">
                          Updated
                        </Badge>
                        )}
                    </Link>
                    <BookmarkButton seriesUrl={serie.url} />
                  </div>
                  <div className="space-y-2">
                    <Link href={`/series/${serie.url}-${serie.url_code}/chapter-${serie.chapters[0].chapter_number}`} prefetch={true}>
                      <h3 className="font-semibold text-sm text-text-900 line-clamp-2 space-y-2">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-text-600">
                        <div className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          <span className="truncate">Chapter {serie.chapters[0].chapter_number}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatDistanceToNow(new Date(serie.chapters[0].updated_at))}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
          </ScrollArea>
      </section>
    </div>
  );
};

export default ContinueContent;