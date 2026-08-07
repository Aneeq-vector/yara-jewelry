import { m as motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Category, Product } from '@/types';

export function ShopSidebarFilters({ 
  categories, products, selectedCategory, handleCategoryChange, 
  priceRanges, priceRange, setPriceRange 
}: any) {
  return (
    <>
            {/* Sidebar Filters — Desktop */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="glass-card rounded-3xl p-6 sticky top-28">
                <h3 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-5">
                  Categories
                </h3>
                <div className="space-y-1 mb-8">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition',
                      selectedCategory === 'all'
                        ? 'bg-burgundy text-ivory font-semibold'
                        : 'text-burgundy/60 hover:bg-champagne/50 hover:text-burgundy'
                    )}
                  >
                    All Products
                  </button>
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition',
                        selectedCategory === cat.slug
                          ? 'bg-burgundy text-ivory font-semibold'
                          : 'text-burgundy/60 hover:bg-champagne/50 hover:text-burgundy'
                      )}
                    >
                      {cat.name}
                      <span className="float-right text-xs opacity-50">
                        {cat.slug === 'new-arrivals'
                          ? products.filter((p: any) => (p.category && p.category.toLowerCase() === cat.name.toLowerCase()) || p.badge === 'new').length
                          : products.filter((p: any) => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length}
                      </span>
                    </button>
                  ))}
                </div>

                <h3 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-5">
                  Price Range
                </h3>
                <div className="space-y-1">
                  {priceRanges.map((range: any, i: number) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(i)}
                      className={cn(
                        'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition',
                        priceRange === i
                          ? 'bg-burgundy text-ivory font-semibold'
                          : 'text-burgundy/60 hover:bg-champagne/50 hover:text-burgundy'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>

    </>
  );
}
