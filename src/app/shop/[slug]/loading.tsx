import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="bg-ivory min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Image Gallery Skeleton */}
          <div className="w-full lg:w-1/2 space-y-4">
            <Skeleton className="w-full aspect-square rounded-3xl bg-burgundy/5" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-24 aspect-square rounded-2xl bg-burgundy/5" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="w-full lg:w-1/2 flex flex-col pt-8">
            <Skeleton className="h-4 w-32 bg-burgundy/10 mb-4" />
            <Skeleton className="h-10 w-3/4 bg-burgundy/10 mb-4" />
            <Skeleton className="h-8 w-40 bg-burgundy/10 mb-8" />
            
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full bg-burgundy/5" />
              <Skeleton className="h-4 w-full bg-burgundy/5" />
              <Skeleton className="h-4 w-3/4 bg-burgundy/5" />
            </div>

            <div className="space-y-4 mb-8">
              <Skeleton className="h-6 w-24 bg-burgundy/10" />
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20 rounded-xl bg-burgundy/5" />
                ))}
              </div>
            </div>

            <Skeleton className="h-14 w-full rounded-xl bg-burgundy/10 mb-8" />
            
            <div className="space-y-4 pt-8 border-t border-burgundy/10">
              <Skeleton className="h-6 w-full bg-burgundy/5" />
              <Skeleton className="h-6 w-full bg-burgundy/5" />
              <Skeleton className="h-6 w-full bg-burgundy/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
