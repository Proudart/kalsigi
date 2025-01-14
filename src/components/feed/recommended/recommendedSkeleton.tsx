import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area"
import { Skeleton } from "../../../components/ui/skeleton"

export default function RecommendedSkeleton() {
  return (
    <div>
      <section>
        <Skeleton className="h-8 w-40 mb-4" />
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background-300">
          <div className="flex w-max space-x-4 p-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="w-[150px] space-y-3">
                <div className="relative">
                  <Skeleton className="w-[150px] h-[200px]" />
                  <Skeleton className="absolute top-1 right-1 w-8 h-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-primary-100 hover:bg-primary-200" />
        </ScrollArea>
      </section>
    </div>
  )
}