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
      className="object-cover w-full aspect-[2/3]"
      loading="lazy"
      placeholder="blur"
      blurDataURL={`${src}&w=16&q=1`}
    />
  );
};

const RecommendedContent = ({ data }: { data: any[] }) => {
  return (
    <div>
      <section>
        <h2 className="text-2xl font-bold mb-4">Recommended</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
          <div className="flex w-max space-x-4 p-4">
            {data.map((manga, index) => (
              <div key={manga.url + index} className="w-[150px] space-y-3">
                <div className="relative">
                  {/* Image wrapped in Link */}
                  <Link
                    href={`/series/${manga.url}-${manga.url_code}`}
                    prefetch={true}
                  >
                    <SeriesImage
                      src={manga.cover_image_url}
                      alt={manga.title}
                      width={150}
                      height={200}
                    />
                  </Link>
                  {/* BookmarkButton outside of Link */}
                  <BookmarkButton seriesUrl={manga.url} />
                </div>
                
                {/* Title in separate Link */}
                <Link
                  href={`/series/${manga.url}-${manga.url_code}`}
                  prefetch={true}
                >
                  <h3 className="font-semibold text-sm text-text-900 line-clamp-2">
                    {manga.title}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
        </ScrollArea>
      </section>
    </div>
  );
};

export default RecommendedContent;