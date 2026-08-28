'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  ShoppingBag,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { ShopToolbar } from './components/ShopToolbar';
import { ShopSidebarFilters } from './components/ShopSidebarFilters';
import { ShopMobileFilters } from './components/ShopMobileFilters';
import { ProductCard } from './components/ProductCard';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';
import { Product, CategoryType, Category } from '@/types';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under Rs. 1,000', min: 0, max: 999 },
  { label: 'Rs. 1,000 – Rs. 2,000', min: 1000, max: 2000 },
  { label: 'Rs. 2,000 – Rs. 3,000', min: 2000, max: 3000 },
  { label: 'Above Rs. 3,000', min: 3000, max: Infinity },
];



function ShopContent({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParam = searchParams.get('category') as CategoryType | null;
  const searchQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>(categoryParam || 'all');

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug as any);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(0);
  const [search, setSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { data: products = [], isPending: productsLoading } = useProducts(true, initialProducts);
  const { data: rawCategories = [], isPending: categoriesLoading } = useCategories(initialCategories);
  
  const loading = (productsLoading && !initialProducts) || (categoriesLoading && !initialCategories);

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => {
      if (a.slug === 'new-arrivals') return -1;
      if (b.slug === 'new-arrivals') return 1;
      return 0;
    });
  }, [rawCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(categoryParam || 'all');
  }, [categoryParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchQuery);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      const selectedCategoryObj = categories.find(
        (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.name.toLowerCase() === selectedCategory.toLowerCase()
      );
      if (selectedCategoryObj) {
        if (selectedCategory.toLowerCase() === 'new-arrivals' || selectedCategoryObj.slug === 'new-arrivals') {
          result = result.filter((p) => (p.category && p.category.toLowerCase() === selectedCategoryObj.name.toLowerCase()) || p.badge === 'new');
        } else {
          result = result.filter((p) => p.category && p.category.toLowerCase() === selectedCategoryObj.name.toLowerCase());
        }
      } else {
        result = [];
      }
    }

    // Search filter
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(lower)
      );
    }

    // Price filter
    const range = priceRanges[priceRange];
    result = result.filter((p) => p.price >= range.min && p.price <= range.max);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (a.badge === 'new' ? -1 : (b.badge === 'new' ? 1 : 0)));
        break;
    }

    return result;
  }, [selectedCategory, sortBy, priceRange, search, products, categories]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 pb-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="mb-10"
          >
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-burgundy mb-3">
              {selectedCategory !== 'all'
                ? selectedCategory === 'new-arrivals' ? 'New Arrivals' : (categories.find((c) => c.slug === selectedCategory)?.name || 'Shop')
                : 'Shop All'}
            </h1>
            <p className="font-body text-burgundy/50">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </motion.div>

          <ShopToolbar search={search} setSearch={setSearch} showFilters={showFilters} setShowFilters={setShowFilters} isSortOpen={isSortOpen} setIsSortOpen={setIsSortOpen} sortBy={sortBy} setSortBy={setSortBy} sortOptions={sortOptions} />


          <div className="flex gap-8">
            <ShopSidebarFilters categories={categories} products={products} selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRanges={priceRanges} priceRange={priceRange} setPriceRange={setPriceRange} />

              <ShopMobileFilters showFilters={showFilters} setShowFilters={setShowFilters} categories={categories} selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRanges={priceRanges} priceRange={priceRange} setPriceRange={setPriceRange} />

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Category Pills (Mobile) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 lg:hidden pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition',
                    selectedCategory === 'all'
                      ? 'bg-burgundy text-ivory'
                      : 'bg-champagne/50 text-burgundy/60'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap',
                      selectedCategory === cat.slug
                        ? 'bg-burgundy text-ivory'
                        : 'bg-champagne/50 text-burgundy/60'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {filteredProducts.length > 0 ? (
                  <motion.div
                    key={`${selectedCategory}-${search}-${priceRange}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6"
                  >
                    {filteredProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} aboveFold={i < 3} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 rounded-full bg-champagne/50 flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-burgundy/30" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-burgundy mb-2">No products found</h3>
                    <p className="font-body text-sm text-burgundy/50 mb-6">
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={() => { handleCategoryChange('all'); setSearch(''); setPriceRange(0); }}
                      className="btn-secondary text-sm"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function ShopPageClient({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: Category[] }) {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div className="pt-32 pb-20 text-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
        </div>
      </PageWrapper>
    }>
      <ShopContent initialProducts={initialProducts} initialCategories={initialCategories} />
    </Suspense>
  );
}
