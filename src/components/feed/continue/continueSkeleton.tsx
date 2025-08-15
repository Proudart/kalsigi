import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area"
import { Skeleton } from "../../../components/ui/skeleton"

export default function ContinueSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 pb-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="w-[160px] md:w-[180px] group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <Skeleton className="absolute top-2 left-2 w-8 h-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </section>
  )
}