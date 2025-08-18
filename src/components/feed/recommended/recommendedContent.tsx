import { ScrollBar } from "../../../components/ui/scroll-area";
import { ScrollArea } from "../../../components/ui/scroll-area";
import Image from "next/image";
import { Link } from "../../../components/link";
import BookmarkButton from "../bookmarked";

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

const RecommendedContent = ({ data }: { data: any[] }) => {
  return (
    <section className="space-y-6" data-testid="recommended">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-900 tracking-tight">
          Recommended for You
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-200 text-text-900" data-testid="recommended-badge">
          {data.length} series
        </span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap bg-background-500 rounded-lg border p-3 sm:p-4">
        <div className="flex w-max space-x-3 sm:space-x-4">
          {data.map((manga, index) => (
            <div key={manga.url + index} className="w-[140px] sm:w-[160px] md:w-[180px] group">
              <div className="bg-background-100 rounded-lg p-2 sm:p-3 hover:bg-background-300 transition-colors duration-200 border">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <Link
                    href={`/series/${manga.url}-${manga.url_code}`}
                    prefetch={true}
                  >
                    <div className="aspect-[3/4] bg-background-300 rounded-lg overflow-hidden">
                      <SeriesImage
                        src={manga.cover_image_url}
                        alt={manga.title}
                        width={180}
                        height={240}
                      />
                    </div>
                  </Link>
                  <BookmarkButton seriesUrl={manga.url} />
                </div>
                
                <Link
                  href={`/series/${manga.url}-${manga.url_code}`}
                  prefetch={true}
                >
                  <h3 className="text-sm font-semibold text-text-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                    {manga.title}
                  </h3>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </section>
  );
};

export default RecommendedContent;