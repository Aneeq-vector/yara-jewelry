import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-[80vh] bg-ivory pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 bg-burgundy/10 mb-12" />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items Skeleton */}
          <div className="flex-1 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-burgundy/10">
              <Skeleton className="col-span-6 h-4 w-24 bg-burgundy/10" />
              <Skeleton className="col-span-2 h-4 w-16 bg-burgundy/10" />
              <Skeleton className="col-span-2 h-4 w-16 bg-burgundy/10" />
              <Skeleton className="col-span-2 h-4 w-16 bg-burgundy/10" />
            </div>

            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6 items-center py-6 border-b border-burgundy/5">
                <div className="col-span-6 flex items-center gap-6 w-full">
                  <Skeleton className="w-24 h-24 rounded-2xl bg-burgundy/5 shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-3/4 bg-burgundy/10" />
                    <Skeleton className="h-3 w-1/2 bg-burgundy/5" />
                    <Skeleton className="h-3 w-1/4 bg-burgundy/5" />
                  </div>
                </div>
                <div className="col-span-2 w-full sm:w-auto flex justify-between sm:block">
                  <Skeleton className="h-8 w-24 bg-burgundy/5 rounded-full mx-auto" />
                </div>
                <div className="col-span-2 hidden sm:block">
                  <Skeleton className="h-4 w-20 bg-burgundy/10 mx-auto" />
                </div>
                <div className="col-span-2 hidden sm:flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-full bg-burgundy/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Skeleton */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-champagne/30 rounded-3xl p-8 sticky top-32">
              <Skeleton className="h-8 w-48 bg-burgundy/10 mb-8" />
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 bg-burgundy/5" />
                  <Skeleton className="h-4 w-24 bg-burgundy/10" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 bg-burgundy/5" />
                  <Skeleton className="h-4 w-24 bg-burgundy/10" />
                </div>
                <div className="flex justify-between pt-4 border-t border-burgundy/10">
                  <Skeleton className="h-5 w-24 bg-burgundy/10" />
                  <Skeleton className="h-5 w-32 bg-burgundy/10" />
                </div>
              </div>

              <Skeleton className="h-14 w-full rounded-xl bg-burgundy/10 mb-6" />
              
              <div className="flex items-center gap-3 justify-center">
                <Skeleton className="h-4 w-4 rounded-full bg-burgundy/5" />
                <Skeleton className="h-4 w-48 bg-burgundy/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
