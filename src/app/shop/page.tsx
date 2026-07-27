'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getAllProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
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

function ProductCard({ product, index }: { product: Product; index: number }) {
  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
    }, 600);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ opacity: { duration: 0.4, delay: index * 0.08 }, y: { duration: 0.4, delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }, layout: { duration: 0.2 } }}
      className="group"
    >
      <div className="relative rounded-3xl overflow-hidden bg-champagne/30 mb-4">
        <div className="block relative aspect-square overflow-hidden">
          <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className={`object-cover group-hover:scale-105 transition-all duration-700 ${
                    !product.inStock ? 'opacity-40 grayscale-[30%]' : ''
                  }`}
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
          </Link>

          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
              <button
                onClick={prevImage}
                className="pointer-events-auto p-1.5 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="pointer-events-auto p-1.5 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider text-white ${BADGE_CONFIG[product.badge].color}`}>
              {BADGE_CONFIG[product.badge].label}
            </span>
          </div>
        )}

        {!product.inStock && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <span className="px-4 py-2 bg-white/90 text-burgundy font-ui font-bold text-sm uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
              Out of Stock
            </span>
          </div>
        )}

        {(product.originalPrice || 0) > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-burgundy/90 text-[10px] font-ui font-bold text-ivory">
              -{calculateDiscount(product.price, product.originalPrice || 0)}%
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-burgundy/90 backdrop-blur-sm text-ivory font-ui text-xs font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingBag size={14} />
                )}
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </motion.button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-nude/50 backdrop-blur-sm text-burgundy/50 font-ui text-xs font-semibold uppercase tracking-wider cursor-not-allowed">
                <ShoppingBag size={14} />
                Sold Out
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleItem(product)}
              className={`p-2.5 rounded-xl backdrop-blur-sm transition-colors ${
                wishlisted ? 'bg-rose-gold text-white' : 'bg-ivory/80 text-burgundy hover:bg-ivory'
              }`}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      </div>

      <Link href={`/shop/${product.id}`}>
        <h3 className="font-ui font-semibold text-sm text-burgundy group-hover:text-wine transition-colors mb-1 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
          ))}
          <span className="font-body text-[10px] text-burgundy/40 ml-0.5">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-ui font-bold text-sm text-burgundy">{formatPrice(product.price)}</span>
          {(product.originalPrice || 0) > 0 && (
            <span className="font-body text-xs text-burgundy/35 line-through">{formatPrice(product.originalPrice || 0)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ShopContent() {
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
  };

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(0);
  const [search, setSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats.sort((a, b) => {
        if (a.slug === 'new-arrivals') return -1;
        if (b.slug === 'new-arrivals') return 1;
        return 0;
      }));
      setLoading(false);
    });
  }, []);

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
      const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);
      if (selectedCategoryObj) {
        if (selectedCategory === 'new-arrivals') {
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
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.includes(lower)) ||
          p.shortDescription.toLowerCase().includes(lower)
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
  }, [selectedCategory, sortBy, priceRange, search, products]);

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
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', damping: 20 }}
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

          {/* Toolbar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', damping: 20 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 w-full"
          >
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-burgundy/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-champagne/40 border border-nude/30 font-body text-sm text-burgundy placeholder:text-burgundy/30 focus:outline-none focus:border-rose-gold/40 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-champagne/40 border border-nude/30 font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/70"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center justify-between gap-2 px-4 py-3 w-[170px] rounded-2xl bg-champagne/40 border border-nude/30 font-ui text-xs font-semibold text-burgundy/70 focus:outline-none cursor-pointer hover:bg-champagne/60 transition-colors"
                >
                  <span className="truncate">{sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By'}</span>
                  <ChevronDown size={14} className={`text-burgundy/40 transition-transform shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-[#fdf9f6] rounded-2xl shadow-[0_8px_30px_rgb(155,58,90,0.08)] border border-[#e8d9d0]/60 py-2 z-40"
                      >
                        {sortOptions.map((opt) => (
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

          <div className="flex gap-8">
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
                      'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
                      selectedCategory === 'all'
                        ? 'bg-burgundy text-ivory font-semibold'
                        : 'text-burgundy/60 hover:bg-champagne/50 hover:text-burgundy'
                    )}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
                        selectedCategory === cat.slug
                          ? 'bg-burgundy text-ivory font-semibold'
                          : 'text-burgundy/60 hover:bg-champagne/50 hover:text-burgundy'
                      )}
                    >
                      {cat.name}
                      <span className="float-right text-xs opacity-50">
                        {cat.slug === 'new-arrivals'
                          ? products.filter((p) => (p.category && p.category.toLowerCase() === cat.name.toLowerCase()) || p.badge === 'new').length
                          : products.filter((p) => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length}
                      </span>
                    </button>
                  ))}
                </div>

                <h3 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-5">
                  Price Range
                </h3>
                <div className="space-y-1">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setPriceRange(i)}
                      className={cn(
                        'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
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
                      <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-champagne">
                        <X size={18} />
                      </button>
                    </div>

                    <h4 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-4">Categories</h4>
                    <div className="space-y-1 mb-8">
                      <button
                        onClick={() => { handleCategoryChange('all'); setShowFilters(false); }}
                        className={cn(
                          'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
                          selectedCategory === 'all' ? 'bg-burgundy text-ivory font-semibold' : 'text-burgundy/60 hover:bg-champagne/50'
                        )}
                      >
                        All Products
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { handleCategoryChange(cat.slug); setShowFilters(false); }}
                          className={cn(
                            'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
                            selectedCategory === cat.slug ? 'bg-burgundy text-ivory font-semibold' : 'text-burgundy/60 hover:bg-champagne/50'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    <h4 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/50 mb-4">Price Range</h4>
                    <div className="space-y-1">
                      {priceRanges.map((range, i) => (
                        <button
                          key={i}
                          onClick={() => { setPriceRange(i); setShowFilters(false); }}
                          className={cn(
                            'block w-full text-left px-4 py-2.5 rounded-xl font-ui text-sm transition-all',
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

            {/* Products Grid */}
            <div className="flex-1">
              {/* Category Pills (Mobile) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 lg:hidden pb-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all',
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
                      'flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap',
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
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
                  >
                    {filteredProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div className="pt-32 pb-20 text-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
        </div>
      </PageWrapper>
    }>
      <ShopContent />
    </Suspense>
  );
}
