import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  title?: string;
  description?: string;
}

export function TableSkeleton({ columns, rows = 6, title, description }: TableSkeletonProps) {
  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 bg-burgundy/10 mb-2" />
          <Skeleton className="h-4 w-64 bg-burgundy/5" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl bg-burgundy/5" />
          <Skeleton className="h-10 w-24 rounded-xl bg-burgundy/5" />
          <Skeleton className="h-10 w-10 rounded-xl bg-burgundy/5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-burgundy/5 bg-ivory/30 flex items-center gap-4">
          <Skeleton className="h-10 w-64 rounded-xl bg-burgundy/5" />
          <Skeleton className="h-10 w-24 rounded-xl bg-burgundy/5" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-burgundy/10">
                {[...Array(columns)].map((_, i) => (
                  <th key={i} className="p-4">
                    <Skeleton className="h-4 w-24 bg-burgundy/10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-burgundy/5">
                  {[...Array(columns)].map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      {colIndex === 0 ? (
                        <Skeleton className="h-4 w-4 bg-burgundy/5" />
                      ) : colIndex === 1 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-xl bg-burgundy/5" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24 bg-burgundy/10" />
                            <Skeleton className="h-3 w-16 bg-burgundy/5" />
                          </div>
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-20 bg-burgundy/5" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
