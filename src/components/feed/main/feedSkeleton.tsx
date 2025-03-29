// src/components/feed/main/feedSkeleton.tsx
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";

type Props = {
  title?: string;
};

export default function FeedSkeleton({ title }: Props) {
  return (
    <section>
      <div>
        {title ? (
          <h2 className="text-2xl font-bold mb-4 text-text-900">{title}</h2>
        ) : (
          <Skeleton className="h-8 w-40 mb-4" />
        )}
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
          <div className="flex w-max space-x-4 p-4">
            {Array(10).fill(0).map((_, index) => (
              <div key={index} className="w-[150px] space-y-3">
                <div className="relative overflow-hidden rounded-lg">
                  <Skeleton className="w-[150px] h-[200px] rounded-md" />
                  <Skeleton className="absolute top-2 left-2 w-8 h-8 rounded-full" />
                  <Skeleton className="absolute top-2 right-2 w-16 h-6 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
        </ScrollArea>
      </div>
    </section>
  );
}