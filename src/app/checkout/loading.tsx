import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-ivory pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 bg-burgundy/10 mb-12" />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Forms Skeleton */}
          <div className="flex-1 space-y-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-40 bg-burgundy/10" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl" />
                <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl" />
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 bg-burgundy/10" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="col-span-1 h-12 w-full bg-burgundy/5 rounded-xl" />
                  <Skeleton className="col-span-1 h-12 w-full bg-burgundy/5 rounded-xl" />
                  <Skeleton className="col-span-1 h-12 w-full bg-burgundy/5 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 bg-burgundy/10" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full bg-burgundy/5 rounded-xl" />
                <Skeleton className="h-20 w-full bg-burgundy/5 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl mt-6" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl" />
                <Skeleton className="h-12 w-full bg-burgundy/5 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar Skeleton */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-champagne/30 rounded-3xl p-8 sticky top-32">
              <Skeleton className="h-8 w-48 bg-burgundy/10 mb-8" />
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl bg-burgundy/5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-burgundy/10" />
                      <Skeleton className="h-3 w-1/2 bg-burgundy/5" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-burgundy/10">
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

              <Skeleton className="h-14 w-full rounded-xl bg-burgundy/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
