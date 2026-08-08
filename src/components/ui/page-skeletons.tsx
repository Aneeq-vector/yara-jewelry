import { Skeleton } from "@/components/ui/skeleton";

/** Re-usable shimmer shimmer block */
function Shimmer({ className }: { className: string }) {
  return <Skeleton className={`${className} bg-burgundy/8`} />;
}

/** Simple full-page content skeleton — works for info/static pages */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero / Header band */}
      <div className="bg-champagne/30 py-16 sm:py-24 mb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Shimmer className="h-10 w-56 mx-auto rounded-full" />
          <Shimmer className="h-4 w-96 max-w-full mx-auto rounded-full" />
          <Shimmer className="h-4 w-72 max-w-full mx-auto rounded-full" />
        </div>
      </div>

      {/* Body content blocks */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 pb-24">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Shimmer className="h-6 w-48 rounded-full" />
            <Shimmer className="h-4 w-full rounded-full" />
            <Shimmer className="h-4 w-5/6 rounded-full" />
            <Shimmer className="h-4 w-4/6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard overview skeleton */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 space-y-3 border border-burgundy/5 shadow-sm">
            <Shimmer className="h-9 w-9 rounded-xl" />
            <Shimmer className="h-7 w-20 rounded-full" />
            <Shimmer className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>
      {/* Recent orders table */}
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-4">
        <Shimmer className="h-5 w-40 rounded-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
            <Shimmer className="h-4 flex-1 rounded-full" />
            <Shimmer className="h-4 w-20 rounded-full" />
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard orders skeleton */
export function OrdersListSkeleton() {
  return (
    <div className="space-y-4 pb-20">
      <Shimmer className="h-7 w-32 rounded-full mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-5 space-y-3">
          <div className="flex justify-between items-center">
            <Shimmer className="h-5 w-32 rounded-full" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
          <Shimmer className="h-4 w-48 rounded-full" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, j) => (
              <Shimmer key={j} className="h-14 w-14 rounded-xl" />
            ))}
          </div>
          <div className="flex justify-between items-center pt-1">
            <Shimmer className="h-4 w-24 rounded-full" />
            <Shimmer className="h-4 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Dashboard profile skeleton */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-3xl border border-burgundy/5 shadow-sm p-8 space-y-6">
        <Shimmer className="h-6 w-44 rounded-full" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-3 w-16 rounded-full" />
            <Shimmer className="h-11 w-full rounded-2xl" />
          </div>
        ))}
        <Shimmer className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}

/** Addresses skeleton */
export function AddressesSkeleton() {
  return (
    <div className="space-y-4 pb-20">
      <Shimmer className="h-7 w-36 rounded-full mb-6" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-5 space-y-3">
          <Shimmer className="h-5 w-32 rounded-full" />
          <Shimmer className="h-4 w-64 rounded-full" />
          <Shimmer className="h-4 w-40 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Home page hero + grid skeleton */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <div className="relative h-[80vh] bg-champagne/40 flex items-center justify-center">
        <div className="text-center space-y-5 px-4">
          <Shimmer className="h-4 w-28 mx-auto rounded-full" />
          <Shimmer className="h-14 w-80 max-w-full mx-auto rounded-full" />
          <Shimmer className="h-14 w-64 max-w-full mx-auto rounded-full" />
          <Shimmer className="h-4 w-96 max-w-full mx-auto rounded-full" />
          <div className="flex gap-4 justify-center pt-4">
            <Shimmer className="h-12 w-36 rounded-full" />
            <Shimmer className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Featured collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <Shimmer className="h-8 w-48 mx-auto rounded-full" />
          <Shimmer className="h-4 w-72 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} className="aspect-square w-full rounded-3xl" />
          ))}
        </div>

        {/* Products grid */}
        <div className="text-center space-y-3 pt-10">
          <Shimmer className="h-8 w-56 mx-auto rounded-full" />
          <Shimmer className="h-4 w-64 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Shimmer className="aspect-square w-full rounded-3xl" />
              <Shimmer className="h-4 w-3/4 rounded-full" />
              <Shimmer className="h-4 w-1/3 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Gift boxes page skeleton */
export function GiftBoxesSkeleton() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      <div className="bg-champagne/30 py-16 sm:py-24 mb-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Shimmer className="h-10 w-56 mx-auto rounded-full" />
          <Shimmer className="h-4 w-80 mx-auto rounded-full" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden border border-burgundy/5 shadow-sm space-y-4">
            <Shimmer className="aspect-video w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Shimmer className="h-5 w-40 rounded-full" />
              <Shimmer className="h-4 w-full rounded-full" />
              <Shimmer className="h-4 w-4/5 rounded-full" />
              <Shimmer className="h-11 w-full rounded-2xl mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Wishlist skeleton */
export function WishlistSkeleton() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-8">
        <Shimmer className="h-8 w-36 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Shimmer className="aspect-square w-full rounded-3xl" />
              <Shimmer className="h-4 w-3/4 rounded-full" />
              <Shimmer className="h-4 w-1/3 rounded-full" />
              <Shimmer className="h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Contact page skeleton */
export function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      <div className="bg-champagne/30 py-16 sm:py-24 mb-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Shimmer className="h-10 w-48 mx-auto rounded-full" />
          <Shimmer className="h-4 w-80 mx-auto rounded-full" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-3 w-16 rounded-full" />
              <Shimmer className="h-11 w-full rounded-2xl" />
            </div>
          ))}
          <Shimmer className="h-32 w-full rounded-2xl" />
          <Shimmer className="h-12 w-36 rounded-full" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <Shimmer className="h-12 w-12 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Shimmer className="h-5 w-28 rounded-full" />
                <Shimmer className="h-4 w-48 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
