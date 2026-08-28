import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';
import { Product } from '@/types';
import { getOptimizedImageUrl, isPocketBaseResizable } from '@/lib/image-utils';


export function ProductCard({ product, index, priority = false }: { product: Product; index: number, priority?: boolean }) {
  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const [addError, setAddError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setIsAdding(true);
    setAddError(null);
    setTimeout(() => {
      const res = addToCart(product);
      if (res && !res.success) {
        setAddError(res.message || 'Cannot add more to cart');
        setTimeout(() => setAddError(null), 3000);
      }
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
                  src={getOptimizedImageUrl(product.images[currentImageIndex], 'card')}
                  alt={product.name}
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectPosition: product.imagePositions?.[currentImageIndex] || '50% 50%' }}
                  className={`object-cover group-hover:scale-105 transition duration-700 ${
                    product.quantity <= 0 ? 'opacity-40 grayscale-[30%]' : ''
                  }`}
                  priority={priority}
                  loading={priority ? undefined : "lazy"}
                  unoptimized={isPocketBaseResizable(product.images[currentImageIndex])}
                />
              </motion.div>
            </AnimatePresence>
          </Link>

          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
              <button
                onClick={prevImage}
                aria-label="Interactive control" className="pointer-events-auto p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                aria-label="Interactive control" className="pointer-events-auto p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-sm"
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

        {product.quantity <= 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <span className="px-4 py-2 bg-white/90 text-burgundy font-ui font-bold text-sm uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
              Out of Stock
            </span>
          </div>
        )}

        <AnimatePresence>
          {addError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%]"
            >
              <div className="px-3 py-2 bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-700 font-body text-xs rounded-xl shadow-lg text-center leading-tight">
                {addError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(product.originalPrice || 0) > 0 && (
          <div className="absolute bottom-3 left-3 z-10 transition-opacity duration-300 lg:group-hover:opacity-0">
            <span className="px-2.5 py-1 rounded-full bg-burgundy/90 text-[10px] font-ui font-bold text-ivory shadow-sm">
              -{calculateDiscount(product.price, product.originalPrice || 0)}%
            </span>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          className={`absolute top-3 right-3 z-20 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full backdrop-blur-md transition-colors ${
            wishlisted ? 'bg-rose-gold text-white shadow-md' : 'bg-white/80 text-burgundy hover:bg-white shadow-sm'
          }`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Desktop Add to Cart Hover */}
        <div className="hidden lg:flex absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition duration-300">
          <div className="w-full flex items-center gap-2">
            {product.quantity > 0 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px] rounded-xl bg-burgundy/90 backdrop-blur-sm text-ivory font-ui text-xs font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingBag size={14} />
                )}
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </motion.button>
            ) : (
              <div className="flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px] rounded-xl bg-nude/50 backdrop-blur-sm text-burgundy/50 font-ui text-xs font-semibold uppercase tracking-wider cursor-not-allowed">
                <ShoppingBag size={14} />
                Sold Out
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-col">
        <h3 className="font-ui font-semibold text-sm text-burgundy group-hover:text-wine transition-colors mb-1 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
          ))}
          <span className="font-body text-[10px] text-burgundy/40 ml-0.5">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="w-full flex items-center gap-2">
            <span className="font-ui font-bold text-sm text-burgundy">{formatPrice(product.price)}</span>
            {(product.originalPrice || 0) > 0 && (
              <span className="font-body text-xs text-burgundy/35 line-through">{formatPrice(product.originalPrice || 0)}</span>
            )}
          </div>

          {/* Mobile Quick Add */}
          <button aria-label="Action" 
            onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
            disabled={product.quantity <= 0 || isAdding}
            className={`p-2 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors lg:hidden ${
              product.quantity > 0 
                ? 'bg-burgundy text-white shadow-sm hover:bg-wine' 
                : 'bg-nude/50 text-burgundy/30 cursor-not-allowed'
            }`}
          >
             {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
