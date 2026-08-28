'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
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
import { ProductInfo } from './components/ProductInfo';
import { ProductTabs } from './components/ProductTabs';
import { SizeGuideModal } from './components/SizeGuideModal';
import { RelatedProducts } from './components/RelatedProducts';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useProductDetail, useProducts, useRelatedProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { Product, Category } from '@/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { getOptimizedImageUrl, isPocketBaseResizable, pbLoader } from '@/lib/image-utils';

import { BADGE_CONFIG, BRAND } from '@/lib/constants';

export default function ProductDetailClient({ 
  id, 
  initialProduct, 
  initialCategories, 
  initialRelatedProducts, 
  initialAllProducts 
}: { 
  id: string, 
  initialProduct?: Product, 
  initialCategories?: Category[], 
  initialRelatedProducts?: Product[], 
  initialAllProducts?: Product[] 
}) {
  const { data: product, isPending: productLoading } = useProductDetail(id, initialProduct);
  
  // Only fetch full catalog if this is a custom box
  const isCustomBox = product?.name.toLowerCase() === 'build your own gift box';
  const { data: allProducts = [] } = useProducts(isCustomBox || false, initialAllProducts);
  
  const { data: categories = [], isPending: categoriesLoading } = useCategories(initialCategories);
  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.categoryId || '',
    product?.id || '',
    initialRelatedProducts
  );

  const loading = (productLoading && !initialProduct) || (categoriesLoading && !initialCategories);

  const categoryObj = product ? categories.find(c => c.id === product.category || c.name.toLowerCase() === product.category.toLowerCase()) : null;

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

  useEffect(() => {
    if (product && typeof product.quantity === 'number') {
      if (quantity > product.quantity) {
        setQuantity(Math.max(1, product.quantity));
      }
    }
  }, [product?.quantity]);


  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  const [addError, setAddError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setIsAdding(true);
    setAddError(null);
    // Simulate network delay for UX
    setTimeout(() => {
      if (product) {
        const res = addToCart(product, quantity, selectedColor || product.colors?.[0]);
        if (res && !res.success) {
          setAddError(res.message || 'Cannot add more to cart');
          setTimeout(() => setAddError(null), 4000);
        }
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
            {product && (
              <Link href={`/shop?category=${categoryObj?.slug || product.category.toLowerCase()}`} className="hover:text-burgundy transition-colors capitalize">
                {categoryObj?.name || product.category}
              </Link>
            )}
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
                      style={{ objectPosition: product.imagePositions?.[selectedImage] || '50% 50%' }}
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      loading={selectedImage === 0 ? "eager" : "lazy"}
                      loader={isPocketBaseResizable(product.images[selectedImage]) ? pbLoader : undefined}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 50vw" 
                    />
                    
                    {/* Idle Prefetch next image */}
                    {product.images.length > 1 && selectedImage + 1 < product.images.length && (
                       <link rel="prefetch" href={product.images[selectedImage + 1]} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      aria-label="Interactive control" className="pointer-events-auto p-2 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      aria-label="Interactive control" className="pointer-events-auto p-2 rounded-full bg-white/80 text-burgundy hover:bg-white transition-colors shadow-md"
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
                {product.images.map((img: string, i: number) => (
                  <button
                    key={img}
                    ref={(el) => { thumbnailRefs.current[i] = el; }}
                    onClick={() => setSelectedImage(i)}
                    className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition snap-center ${
                      selectedImage === i
                        ? 'ring-2 ring-burgundy ring-offset-2 ring-offset-ivory'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" style={{ objectPosition: product.imagePositions?.[i] || '50% 50%' }} className="object-cover" loader={isPocketBaseResizable(img) ? pbLoader : undefined} />
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
              <ProductInfo product={product} categoryName={categoryObj?.name || product.category} selectedColor={selectedColor} setSelectedColor={setSelectedColor} quantity={quantity} setQuantity={setQuantity} handleAddToCart={handleAddToCart} isAdding={isAdding} toggleItem={toggleItem} wishlisted={wishlisted} setIsSizeGuideOpen={setIsSizeGuideOpen} addError={addError} />

              <ProductTabs product={product} activeTab={activeTab} setActiveTab={setActiveTab} />
            </motion.div>
          </div>

          <RelatedProducts relatedProducts={relatedProducts} />
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isSizeGuideOpen={isSizeGuideOpen} setIsSizeGuideOpen={setIsSizeGuideOpen} />
    </PageWrapper>
  );
}
