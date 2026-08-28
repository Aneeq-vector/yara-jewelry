'use client';

import { getOptimizedImageUrl, isPocketBaseResizable } from '@/lib/image-utils';
import { useState, useSyncExternalStore } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, X, Star } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center max-w-md mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-24 h-24 rounded-full bg-champagne/50 flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-burgundy/30" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-burgundy mb-3">Your wishlist is empty</h1>
            <p className="font-body text-burgundy/50 mb-8">
              Save your favorite pieces here to find them easily later.
            </p>
            <Link href="/shop" className="btn-primary inline-block">
              <span>Explore Collection</span>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-burgundy mb-2">
              My Wishlist
            </h1>
            <p className="font-body text-burgundy/50">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {items.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group"
                >
                  <div className="relative rounded-3xl overflow-hidden bg-champagne/30 mb-4">
                    <Link href={`/shop/${product.id}`} className="block relative aspect-square">
                      <Image src={getOptimizedImageUrl(product.images[0], "card")}
                      unoptimized={isPocketBaseResizable(product.images[0])} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </Link>

                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label="Interactive control" className="absolute top-3 right-3 p-2 rounded-full bg-ivory/80 backdrop-blur-sm text-burgundy/60 hover:bg-ivory hover:text-burgundy transition-colors"
                    >
                      <X size={14} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-burgundy/90 backdrop-blur-sm text-ivory font-ui text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300"
                      >
                        <ShoppingBag size={14} />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>

                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-ui font-semibold text-sm text-burgundy mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={10} className={j < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
                      ))}
                    </div>
                    <span className="font-ui font-bold text-sm text-burgundy">{formatPrice(product.price)}</span>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
