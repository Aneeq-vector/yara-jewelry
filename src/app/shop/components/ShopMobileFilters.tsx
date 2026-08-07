import { m as motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

export function ShopMobileFilters({ 
  showFilters, setShowFilters, categories, selectedCategory, handleCategoryChange, 
  priceRanges, priceRange, setPriceRange 
}: any) {
  return (
    <>
            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-0 left-0 bottom-0 w-80 bg-ivory p-6 overflow-y-auto shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-heading text-xl font-bold text-burgundy">Filters</h3>
                      <button aria-label="Action" onClick={() => setShowFilters(false)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-champagne">
                        <X size={18} />
                      </button>
                    </div>

                    <h4 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-4">Categories</h4>
                    <div className="space-y-1 mb-8">
                      <button
                        onClick={() => { handleCategoryChange('all'); setShowFilters(false); }}
                        className={cn(
                          'block w-full text-left px-4 py-2.5 min-h-[44px] rounded-xl font-ui text-sm transition',
                          selectedCategory === 'all' ? 'bg-burgundy text-ivory font-semibold' : 'text-burgundy/60 hover:bg-champagne/50'
                        )}
                      >
                        All Products
                      </button>
                      {categories.map((cat: any) => (
                        <button
                          key={cat.id}
                          onClick={() => { handleCategoryChange(cat.slug); setShowFilters(false); }}
                          className={cn(
                            'block w-full text-left px-4 py-2.5 min-h-[44px] rounded-xl font-ui text-sm transition',
                            selectedCategory === cat.slug ? 'bg-burgundy text-ivory font-semibold' : 'text-burgundy/60 hover:bg-champagne/50'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    <h4 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-4">Price Range</h4>
                    <div className="space-y-1">
                      {priceRanges.map((range: any, i: number) => (
                        <button
                          key={range.label}
                          onClick={() => { setPriceRange(i); setShowFilters(false); }}
                          className={cn(
                            'block w-full text-left px-4 py-2.5 min-h-[44px] rounded-xl font-ui text-sm transition',
                            priceRange === i ? 'bg-burgundy text-ivory font-semibold' : 'text-burgundy/60 hover:bg-champagne/50'
                          )}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

    </>
  );
}
