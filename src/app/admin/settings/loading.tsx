import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-5xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 bg-burgundy/10 mb-2" />
          <Skeleton className="h-4 w-64 bg-burgundy/5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-burgundy/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-2 flex flex-col">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${i === 0 ? 'bg-burgundy/5' : ''}`}>
              <Skeleton className="h-4 w-4 bg-burgundy/10" />
              <Skeleton className="h-4 w-24 bg-burgundy/10" />
            </div>
          ))}
        </div>

        {/* Settings Content Area Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm p-6 sm:p-8 min-h-[400px]">
            <Skeleton className="h-6 w-48 bg-burgundy/10 mb-6" />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-burgundy/10" />
                  <Skeleton className="h-12 w-full rounded-xl bg-burgundy/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-burgundy/10" />
                  <Skeleton className="h-12 w-full rounded-xl bg-burgundy/5" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-burgundy/10" />
                <Skeleton className="h-24 w-full rounded-xl bg-burgundy/5" />
              </div>

              <div className="space-y-2 pt-4 border-t border-burgundy/5">
                <Skeleton className="h-5 w-40 bg-burgundy/10 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-burgundy/10" />
                    <Skeleton className="h-12 w-full rounded-xl bg-burgundy/5" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-burgundy/10" />
                    <Skeleton className="h-12 w-full rounded-xl bg-burgundy/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
