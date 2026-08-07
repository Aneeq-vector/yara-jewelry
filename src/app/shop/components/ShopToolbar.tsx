import { m as motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

export function ShopToolbar({ 
  search, setSearch, showFilters, setShowFilters, 
  isSortOpen, setIsSortOpen, sortBy, setSortBy, sortOptions 
}: any) {
  return (
    <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 w-full"
          >
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-burgundy/30" />
              <input aria-label="Search products..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-champagne/40 border border-nude/30 font-body text-sm text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-rose-gold/40 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-2xl bg-champagne/40 border border-nude/30 font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/70"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              {/* Sort */}
              <div className="relative flex-1 sm:flex-none">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px] w-full sm:w-[170px] rounded-2xl bg-champagne/40 border border-nude/30 font-ui text-xs font-semibold text-burgundy/70 focus:outline-none cursor-pointer hover:bg-champagne/60 transition-colors"
                >
                  <span className="truncate">{sortOptions.find((opt: any) => opt.value === sortBy)?.label || 'Sort By'}</span>
                  <ChevronDown size={14} className={`text-burgundy/40 transition-transform shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <button type="button" aria-label="Close sort menu" className="fixed inset-0 z-30 w-full cursor-default" onClick={() => setIsSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-[#fdf9f6] rounded-2xl shadow-[0_8px_30px_rgb(155,58,90,0.08)] border border-[#e8d9d0]/60 py-2 z-40"
                      >
                        {sortOptions.map((opt: any) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 font-body text-sm font-medium text-left hover:bg-[#c9856a]/10 transition-colors ${
                              sortBy === opt.value ? 'text-[#4a1c27]' : 'text-[#4a1c27]/60'
                            }`}
                          >
                            <span className="w-4 flex justify-center text-[#c9856a]">
                              {sortBy === opt.value && <Check size={16} strokeWidth={2.5} />}
                            </span>
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
    </>
  );
}
