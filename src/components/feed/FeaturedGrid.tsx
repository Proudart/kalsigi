import { Suspense } from "react";
import Updated from "./updated/updated";
import Recommended from "./recommended/recommended";
import UpdatedSkeleton from "./updated/updatedSkeleton";
import RecommendedSkeleton from "./recommended/recommendedSkeleton";

export default function FeaturedGrid() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
      <Suspense fallback={
        <div className="flex-1 bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
          <UpdatedSkeleton />
        </div>
      }>
        <Updated />
      </Suspense>

      <Suspense fallback={
        <div className="flex-1 bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
          <RecommendedSkeleton />
        </div>
      }>
        <Recommended />
      </Suspense>
    </div>
  );
}
