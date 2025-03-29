// src/components/feed/main/discoverMangaSkeleton.tsx
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";

export default function DiscoverMangaSkeleton() {
  return (
    <section className="mt-8 bg-background-100 rounded-lg shadow-md">
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
        <div className="flex w-max space-x-4 p-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="w-[150px] space-y-3">
              <div className="relative">
                <Skeleton className="w-[150px] h-[200px] rounded-md" />
                <Skeleton className="absolute top-2 left-2 w-8 h-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
      </ScrollArea>
    </section>
  );
}