import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-burgundy/10" />
          <Skeleton className="h-4 w-64 bg-burgundy/5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-burgundy/10" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-burgundy/5 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-burgundy/5" />
                <Skeleton className="h-8 w-32 bg-burgundy/10" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full bg-burgundy/5" />
            </div>
            <Skeleton className="h-3 w-40 bg-burgundy/5" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 space-y-6">
        <Skeleton className="h-6 w-40 bg-burgundy/10" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-burgundy/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
