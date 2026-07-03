import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Page Header Skeleton */}
      <div className="bg-champagne/30 py-16 sm:py-24 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-12 w-64 mx-auto bg-burgundy/10 mb-4" />
          <Skeleton className="h-4 w-96 mx-auto bg-burgundy/5" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters Skeleton */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 bg-burgundy/10 mb-6" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 bg-burgundy/5 rounded" />
                  <Skeleton className="h-4 w-24 bg-burgundy/5" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 bg-burgundy/10 mb-6" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 bg-burgundy/5 rounded" />
                  <Skeleton className="h-4 w-20 bg-burgundy/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-4 w-32 bg-burgundy/5" />
              <Skeleton className="h-10 w-40 bg-burgundy/10 rounded-xl" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-3xl bg-burgundy/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-burgundy/10" />
                    <Skeleton className="h-4 w-1/4 bg-burgundy/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
