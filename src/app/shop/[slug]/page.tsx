'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Star,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Ruler,
  X,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { getProductBySlug, products } from '@/lib/data/products';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { BADGE_CONFIG } from '@/lib/constants';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  if (!product) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-4">Product not found</h1>
          <Link href="/shop" className="btn-primary inline-block">
            <span>Back to Shop</span>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (product.slug === 'build-your-own-gift-box') {
    return (
      <PageWrapper>
        <CustomBoxBuilder baseBox={product} />
      </PageWrapper>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <PageWrapper>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-8 font-body text-xs text-burgundy/40"
          >
            <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-burgundy transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <Link href={`/shop?category=${product.category}`} className="hover:text-burgundy transition-colors capitalize">
              {product.category.replace('-', ' ')}
            </Link>
            <ChevronRight size={12} />
            <span className="text-burgundy/70 truncate max-w-[200px]">{product.name}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-champagne/30 mb-4 group cursor-zoom-in">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                />
                {product.badge && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-xs font-ui font-bold uppercase tracking-wider text-white ${BADGE_CONFIG[product.badge].color}`}>
                      {BADGE_CONFIG[product.badge].label}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all ${
                      selectedImage === i
                        ? 'ring-2 ring-burgundy ring-offset-2 ring-offset-ivory'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              {/* Category */}
              <span className="font-ui text-xs font-semibold uppercase tracking-[0.15em] text-rose-gold mb-3 block">
                {product.category.replace('-', ' ')}
              </span>

              {/* Name */}
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-burgundy/50">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="font-body tracking-tight text-3xl font-bold text-burgundy">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="font-body text-lg text-burgundy/35 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-ui text-xs font-bold">
                      Save {calculateDiscount(product.price, product.originalPrice)}%
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="font-body text-burgundy/60 leading-relaxed mb-4">
                {product.shortDescription}
              </p>

              <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-sm font-ui font-semibold text-burgundy hover:text-rose-gold transition-colors mt-6 mb-8">
                <Ruler size={16} />
                <span className="underline underline-offset-4">Size Guide</span>
              </button>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-3">
                    Color: {selectedColor || product.colors[0]}
                  </h4>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl border font-ui text-sm transition-all ${
                          (selectedColor || product.colors![0]) === color
                            ? 'border-burgundy bg-burgundy text-ivory font-semibold'
                            : 'border-nude/50 text-burgundy/60 hover:border-burgundy/30'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-3">
                  Quantity
                </h4>
                <div className="flex items-center gap-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-nude/50 flex items-center justify-center text-burgundy/60 hover:border-burgundy/30 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-ui font-semibold text-burgundy">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl border border-nude/50 flex items-center justify-center text-burgundy/60 hover:border-burgundy/30 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product, quantity, selectedColor || product.colors?.[0])}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} className="relative z-10" />
                  <span>Add to Cart</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(product)}
                  className={`p-4 rounded-full border transition-all ${
                    wishlisted
                      ? 'border-rose-gold bg-rose-gold text-white'
                      : 'border-nude/50 text-burgundy/60 hover:border-rose-gold hover:text-rose-gold'
                  }`}
                >
                  <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-full border border-nude/50 text-burgundy/60 hover:border-burgundy/30 transition-colors"
                >
                  <Share2 size={20} />
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Truck, label: 'Free Shipping', sub: 'Orders above Rs. 999' },
                  { icon: RotateCcw, label: 'Easy Returns', sub: '7-day returns' },
                  { icon: Shield, label: 'Quality Assured', sub: 'Premium materials' },
                ].map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="text-center p-3 rounded-2xl bg-champagne/30">
                      <Icon size={18} className="mx-auto mb-1.5 text-rose-gold" />
                      <p className="font-ui font-semibold text-[10px] uppercase tracking-wider text-burgundy/70">{badge.label}</p>
                      <p className="font-body text-[10px] text-burgundy/40">{badge.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Tabs */}
              <div className="border-t border-nude/30 pt-8">
                <div className="flex gap-6 mb-6">
                  {(['description', 'details', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`font-ui text-sm font-semibold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'text-burgundy border-burgundy'
                          : 'text-burgundy/40 border-transparent hover:text-burgundy/60'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <p className="font-body text-sm text-burgundy/60 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Material</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.material}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Weight</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.weight}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Colors Available</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.colors?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-ui text-sm text-burgundy/50">In Stock</span>
                      <span className="font-ui text-sm font-semibold text-emerald-600 flex items-center gap-1">
                        <Check size={14} /> Available
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <div className="font-heading text-4xl font-bold text-burgundy">{product.rating}</div>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
                          ))}
                        </div>
                        <p className="font-body text-xs text-burgundy/40 mt-1">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                    {/* Sample reviews */}
                    {[
                      { name: 'Ananya S.', rating: 5, comment: 'Absolutely gorgeous! The quality is amazing for the price. Will buy again.', date: '2 weeks ago' },
                      { name: 'Priya M.', rating: 4, comment: 'Beautiful piece, exactly as shown. Packaging was lovely too!', date: '1 month ago' },
                    ].map((review, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-ui font-semibold text-sm text-burgundy">{review.name}</span>
                          <span className="font-body text-xs text-burgundy/40">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={11} className={j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
                          ))}
                        </div>
                        <p className="font-body text-sm text-burgundy/60">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-heading text-3xl font-bold text-burgundy mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <Link href={`/shop/${p.slug}`}>
                      <div className="relative aspect-square rounded-3xl overflow-hidden bg-champagne/30 mb-3">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <h3 className="font-ui font-semibold text-sm text-burgundy mb-1 line-clamp-1">{p.name}</h3>
                      <span className="font-ui font-bold text-sm text-burgundy">{formatPrice(p.price)}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-burgundy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-ivory rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 sm:px-10 sm:py-6 border-b border-burgundy/10 shrink-0 bg-ivory z-10">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-burgundy">Size Guide</h2>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="p-2 rounded-full bg-champagne text-burgundy hover:bg-rose-gold/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 sm:px-10 sm:py-8 overflow-y-auto flex-1">
                <p className="font-body text-sm text-burgundy/60 mb-8">
                  Use this guide to find your perfect fit. Measurements are approximate and may vary slightly by style.
                </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-wider text-rose-gold mb-4">Necklaces</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body text-left border-collapse">
                      <thead>
                        <tr className="border-b border-burgundy/10 text-burgundy/80">
                          <th className="pb-3 font-semibold">Style</th>
                          <th className="pb-3 font-semibold">Length (inches)</th>
                          <th className="pb-3 font-semibold">Length (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-burgundy/60">
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Choker</td>
                          <td className="py-3">14&quot; - 16&quot;</td>
                          <td className="py-3">35 - 40 cm</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Princess</td>
                          <td className="py-3">18&quot;</td>
                          <td className="py-3">45 cm</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Matinee</td>
                          <td className="py-3">20&quot; - 24&quot;</td>
                          <td className="py-3">50 - 60 cm</td>
                        </tr>
                        <tr>
                          <td className="py-3">Opera</td>
                          <td className="py-3">28&quot; - 36&quot;</td>
                          <td className="py-3">71 - 91 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-wider text-rose-gold mb-4">Rings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body text-left border-collapse">
                      <thead>
                        <tr className="border-b border-burgundy/10 text-burgundy/80">
                          <th className="pb-3 font-semibold">US Size</th>
                          <th className="pb-3 font-semibold">UK/AU Size</th>
                          <th className="pb-3 font-semibold">Inner Circumference (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-burgundy/60">
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">5</td>
                          <td className="py-3">J 1/2</td>
                          <td className="py-3">49.3</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">6</td>
                          <td className="py-3">M</td>
                          <td className="py-3">51.9</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">7</td>
                          <td className="py-3">O</td>
                          <td className="py-3">54.4</td>
                        </tr>
                        <tr>
                          <td className="py-3">8</td>
                          <td className="py-3">Q</td>
                          <td className="py-3">57.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
