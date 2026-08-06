'use client';

import { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  Minus,
  Plus,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Ruler,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getProductById, getAllProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import { Product, Category } from '@/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { BADGE_CONFIG, BRAND } from '@/lib/constants';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductById(id), getAllProducts(), getAllCategories()]).then(([prod, prods, cats]) => {
      setProduct(prod || null);
      setAllProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  const [selectedImage, setSelectedImage] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[selectedImage];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedImage]);

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate network delay for UX
    setTimeout(() => {
      if (product) {
        addToCart(product, quantity, selectedColor || product.colors?.[0]);
      }
      setIsAdding(false);
    }, 600);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
        </div>
      </PageWrapper>
    );
  }

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

  if (product.name.toLowerCase() === 'build your own gift box') {
    return (
      <PageWrapper>
        <CustomBoxBuilder baseBox={product} allProducts={allProducts} />
      </PageWrapper>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = allProducts
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
            {(() => {
              const categoryObj = categories.find(c => c.id === product.category || c.name.toLowerCase() === product.category.toLowerCase());
              return (
                <Link href={`/shop?category=${categoryObj?.slug || product.category.toLowerCase()}`} className="hover:text-burgundy transition-colors capitalize">
                  {categoryObj?.name || product.category}
                </Link>
              );
            })()}
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
                <AnimatePresence initial={false}>
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      priority
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="pointer-events-auto p-2 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="pointer-events-auto p-2 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {product.badge && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-4 py-2 rounded-full text-xs font-ui font-bold uppercase tracking-wider text-white ${BADGE_CONFIG[product.badge as keyof typeof BADGE_CONFIG].color}`}>
                      {BADGE_CONFIG[product.badge as keyof typeof BADGE_CONFIG].label}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto p-1.5 snap-x snap-mandatory no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    ref={(el) => { thumbnailRefs.current[i] = el; }}
                    onClick={() => setSelectedImage(i)}
                    className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all snap-center ${
                      selectedImage === i
                        ? 'ring-2 ring-burgundy ring-offset-2 ring-offset-ivory'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
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
                {(product.originalPrice || 0) > 0 && (
                  <>
                    <span className="font-body text-lg text-burgundy/35 line-through">
                      {formatPrice(product.originalPrice || 0)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-ui text-xs font-bold">
                      Save {calculateDiscount(product.price, product.originalPrice || 0)}%
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

              {/* Out of Stock Alert */}
              {!product.inStock && (
                <Alert variant="destructive" className="mb-8 bg-red-50 py-4 flex items-start gap-3 border-red-200">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                  <div className="flex flex-col gap-1 mt-0.5">
                    <AlertTitle className="text-red-700 font-bold mb-0">Out of Stock</AlertTitle>
                    <AlertDescription className="text-red-600/90 text-sm leading-snug text-wrap">
                      This item is currently unavailable. Contact us on WhatsApp to check on restocking.
                    </AlertDescription>
                  </div>
                </Alert>
              )}

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
              {product.inStock && (
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
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                {product.inStock ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAdding ? (
                      <Loader2 size={16} className="animate-spin relative z-10" />
                    ) : (
                      <ShoppingBag size={16} className="relative z-10" />
                    )}
                    <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                  </motion.button>
                ) : (
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
                      `Hi! I'm interested in the "${product.name}"${product.colors?.length ? ` (Color: ${selectedColor || product.colors[0]})` : ''} which is currently out of stock. Could you let me know when it will be restocked?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bc5a] transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="font-ui font-bold text-sm text-white">Ask About Restock on WhatsApp</span>
                  </a>
                )}
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
                  <div 
                    className="font-body text-sm text-burgundy/60 leading-relaxed [&>p]:mb-4 last:[&>p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
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
                      <span className="font-ui text-sm text-burgundy/50">Availability</span>
                      {product.inStock ? (
                        <span className="font-ui text-sm font-semibold text-emerald-600 flex items-center gap-1">
                          <Check size={14} /> In Stock
                        </span>
                      ) : (
                        <span className="font-ui text-sm font-semibold text-rose-500 flex items-center gap-1">
                          <X size={14} /> Out of Stock
                        </span>
                      )}
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
                    <Link href={`/shop/${p.id}`}>
                      <div className="relative aspect-square rounded-3xl overflow-hidden bg-champagne/30 mb-3">
                        <Image src={p.images[0]} alt={p.name} fill className={`object-cover group-hover:scale-105 transition-all duration-700 ${
                          !p.inStock ? 'opacity-40 grayscale-[30%]' : ''
                        }`} />
                        {!p.inStock && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center">
                            <span className="px-4 py-2 bg-white/90 text-burgundy font-ui font-bold text-xs uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
                              Out of Stock
                            </span>
                          </div>
                        )}
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
