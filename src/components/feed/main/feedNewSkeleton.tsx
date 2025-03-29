// src/components/feed/main/feedNewSkeleton.tsx
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";

type Props = {
  title?: string;
};

export default function FeedNewSkeleton({ title }: Props) {
  return (
    <section>
      {title ? <h2 className="text-2xl font-bold mb-4">{title}</h2> : <Skeleton className="h-8 w-40 mb-4" />}
      <ScrollArea className="h-[400px] w-full rounded-md border bg-background-300">
        {Array(8).fill(0).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
            {title === "Trending" && (
              <span className="font-bold text-xl w-6">{index + 1}</span>
            )}
            <Skeleton className="w-[60px] h-[80px] rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        ))}
      </ScrollArea>
    </section>
  );
}