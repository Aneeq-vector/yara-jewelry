'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';
import { Product } from '@/types';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const wishlisted = isInWishlist(product.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group shrink-0 w-[75vw] sm:w-[280px] snap-center"
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
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover group-hover:scale-105 transition duration-700 ${
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
                aria-label="Interactive control" className="pointer-events-auto p-1.5 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                aria-label="Interactive control" className="pointer-events-auto p-1.5 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
        </div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider text-white ${BADGE_CONFIG[product.badge]?.color || 'bg-burgundy'}`}>
              {BADGE_CONFIG[product.badge]?.label || product.badge}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {(product.originalPrice || 0) > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-burgundy/90 text-[10px] font-ui font-bold text-ivory">
              -{calculateDiscount(product.price, product.originalPrice || 0)}%
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <span className="px-4 py-2 bg-white/90 text-burgundy font-ui font-bold text-sm uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition duration-300">
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-burgundy/90 backdrop-blur-sm text-ivory font-ui text-xs font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
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
                  isMounted && wishlisted
                    ? 'bg-rose-gold text-white'
                    : 'bg-ivory/80 text-burgundy hover:bg-ivory'
                }`}
              >
                <Heart size={14} fill={isMounted && wishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              <Link href={`/shop/${product.id}`}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-ivory/80 backdrop-blur-sm text-burgundy hover:bg-ivory transition-colors"
                >
                  <Eye size={14} />
                </motion.div>
              </Link>
            </div>
          </div>
      </div>

      {/* Product Info */}
      <Link href={`/shop/${product.id}`}>
          <h3 className="font-ui font-semibold text-sm text-burgundy group-hover:text-wine transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="font-body text-xs text-burgundy/45 mb-2 line-clamp-1">
            {product.shortDescription}
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'}
                />
              ))}
            </div>
            <span className="font-body text-[10px] text-burgundy/40">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-ui font-bold text-sm text-burgundy">
              {formatPrice(product.price)}
            </span>
            {(product.originalPrice || 0) > 0 && (
              <span className="font-body text-xs text-burgundy/35 line-through">
                {formatPrice(product.originalPrice || 0)}
              </span>
            )}
          </div>
        </Link>
    </motion.div>
  );
}

function ViewAllCard({ bgImage }: { bgImage?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group shrink-0 w-[75vw] sm:w-[280px] snap-center"
    >
      <div className="relative rounded-3xl overflow-hidden bg-champagne/30 mb-4">
        <div className="block relative aspect-square overflow-hidden">
          {bgImage && (
            <Image
              src={bgImage}
              alt="View All Background"
              fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover opacity-60 group-hover:scale-105 transition duration-700"
              unoptimized
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy/30 to-transparent z-0" />
          <Link href="/shop" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-burgundy/10 group-hover:bg-burgundy/30 transition duration-500">
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition duration-300">
              <ArrowRight size={22} className="text-white" />
            </div>
            <div className="text-center px-4">
              <p className="font-heading font-bold text-xl text-white leading-tight">View All</p>
              <p className="font-heading font-bold text-xl text-white/90 leading-tight">Collections</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function TrendingProducts({ products = [] }: { products?: Product[] }) {

  return (
    <section className="section-padding bg-champagne/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-rose-gold/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-nude/20 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div>
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-3 block">
              Most Loved
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-burgundy">
              Trending Now
            </h2>
          </div>
        </motion.div>

        {/* Products Carousel */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory no-scrollbar w-full -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
            />
          ))}
          <ViewAllCard bgImage={products.length > 0 ? products[products.length - 1].images[0] : undefined} />
          {/* Spacer for right edge on mobile */}
          <div className="w-1 shrink-0 sm:hidden"></div>
        </div>
      </div>
    </section>
  );
}
