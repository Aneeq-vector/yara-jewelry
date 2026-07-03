'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Star, ArrowRight } from 'lucide-react';
import { getTrendingProducts } from '@/lib/data/products';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';
import { Product } from '@/types';

function ProductCard({ product, index, isViewAll }: { product: Product; index: number; isViewAll?: boolean }) {
  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="relative rounded-3xl overflow-hidden bg-champagne/30 mb-4">
        {/* Image */}
        <Link href={`/shop/${product.slug}`} className="block relative aspect-square">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Second image on hover */}
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={product.name}
              fill
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badge */}
        {product.badge && !isViewAll && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider text-white ${BADGE_CONFIG[product.badge].color}`}>
              {BADGE_CONFIG[product.badge].label}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && !isViewAll && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-burgundy/90 text-[10px] font-ui font-bold text-ivory">
              -{calculateDiscount(product.price, product.originalPrice)}%
            </span>
          </div>
        )}

        {/* View All Overlay */}
        {isViewAll && (
          <Link href="/shop" className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-burgundy/20 group-hover:bg-burgundy/40 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-white text-burgundy flex items-center justify-center mb-3 shadow-xl group-hover:scale-110 transition-transform">
              <ArrowRight size={24} />
            </div>
            <span className="font-heading font-bold text-xl text-white drop-shadow-md text-center px-4">View All Collections</span>
          </Link>
        )}

        {/* Quick Actions */}
        {!isViewAll && (
          <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => addToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-burgundy/90 backdrop-blur-sm text-ivory font-ui text-xs font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors"
              >
                <ShoppingBag size={14} />
                Add to Cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleItem(product)}
                className={`p-2.5 rounded-xl backdrop-blur-sm transition-colors ${
                  wishlisted
                    ? 'bg-rose-gold text-white'
                    : 'bg-ivory/80 text-burgundy hover:bg-ivory'
                }`}
              >
                <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              <Link href={`/shop/${product.slug}`}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-ivory/80 backdrop-blur-sm text-burgundy hover:bg-ivory transition-colors"
                >
                  <Eye size={14} />
                </motion.div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link href={`/shop/${product.slug}`}>
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
          {product.originalPrice && (
            <span className="font-body text-xs text-burgundy/35 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function TrendingProducts() {
  const products = getTrendingProducts();

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
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12"
        >
          <div>
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-3 block">
              Most Loved
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-burgundy">
              Trending Now
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-ui text-sm font-semibold text-burgundy/60 hover:text-burgundy transition-colors mt-4 sm:mt-0 group"
          >
            View All Products
            <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} isViewAll={i === 7} />
          ))}
        </div>
      </div>
    </section>
  );
}
