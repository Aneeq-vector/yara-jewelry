export default function ProductsLoading() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl bg-burgundy/10 animate-pulse" />
          <div className="h-4 w-64 rounded-xl bg-burgundy/5 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-full bg-burgundy/10 animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl border border-burgundy/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-burgundy/5 flex gap-4">
          <div className="h-10 w-72 rounded-xl bg-burgundy/5 animate-pulse" />
          <div className="h-10 w-24 rounded-full bg-burgundy/5 animate-pulse" />
        </div>
        <div className="divide-y divide-burgundy/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-4 h-4 rounded bg-burgundy/10 animate-pulse" />
              <div className="w-12 h-12 rounded-xl bg-burgundy/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-burgundy/10 animate-pulse" />
                <div className="h-3 w-24 rounded bg-burgundy/5 animate-pulse" />
              </div>
              <div className="h-4 w-20 rounded bg-burgundy/5 animate-pulse" />
              <div className="h-4 w-24 rounded bg-burgundy/5 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-burgundy/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
