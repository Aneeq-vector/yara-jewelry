'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShoppingBag,
  Check,
  Gift,
  Info,
  MessageCircle,
  Lock,
} from 'lucide-react';
import { GiftBox, Product, Category } from '@/types';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { BRAND } from '@/lib/constants';

interface FixedBoxViewerProps {
  box: GiftBox;
  categories?: Category[];
}

const COLOR_SWATCHES: Record<string, string> = {
  gold: '#D4AF37',
  silver: '#C0C0C0',
  'rose gold': '#B76E79',
  'rose-gold': '#B76E79',
  black: '#1a1a1a',
  white: '#F5F5F5',
  pearl: '#FAEBD7',
  red: '#B22222',
  blue: '#4169E1',
  green: '#2E8B57',
  purple: '#6A0DAD',
  pink: '#FF69B4',
  orange: '#FF8C00',
};

function getSwatchColor(color: string): string {
  const key = color.toLowerCase();
  return COLOR_SWATCHES[key] || '#c9856a';
}

interface ItemColorState {
  [productId: string]: string | undefined;
}

// ─── Not Available Screen ────────────────────────────────────────────────────
function NotAvailable({ name }: { name: string }) {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mx-auto w-20 h-20 rounded-full bg-champagne/60 border border-nude/60 flex items-center justify-center"
        >
          <Lock size={32} className="text-burgundy/40" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-4"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-body text-lg text-burgundy/50 mb-8"
        >
          We're currently not offering this gift box. Please check back soon or
          browse our other options.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/gift-boxes"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Gift size={16} />
            View All Gift Boxes
          </Link>
          <a
            href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
              `Hi! I was looking for the "${name}" — is it available?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-green-500/40 bg-green-50 text-green-700 font-ui font-semibold text-sm hover:bg-green-100 transition-colors"
          >
            <MessageCircle size={16} />
            Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Viewer ─────────────────────────────────────────────────────────────
export default function FixedBoxViewer({ box, categories = [] }: FixedBoxViewerProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);
  const [colorSelections, setColorSelections] = useState<ItemColorState>({});
  const [added, setAdded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Show "not available" if is_active is false
  if (!box.isActive) {
    return <NotAvailable name={box.name} />;
  }

  // Unique category IDs from the fixed items
  const itemCategoryIds = useMemo(() => {
    const ids = new Set(box.fixedItems.map((p) => String(p.category)));
    return Array.from(ids);
  }, [box.fixedItems]);

  // Category name lookup
  const catName = (id: string) => {
    const found = categories.find((c) => c.id === id);
    if (found) return found.name;
    return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filtered items
  const visibleItems = useMemo(() => {
    if (activeCategory === 'all') return box.fixedItems;
    return box.fixedItems.filter((p) => String(p.category) === activeCategory);
  }, [activeCategory, box.fixedItems]);

  const totalPrice =
    box.fixedItems.reduce((sum, p) => sum + p.price, 0) + box.boxPrice;

  const handleColorSelect = (productId: string, color: string) => {
    setColorSelections((prev) => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: box.id,
        name: box.name,
        price: box.boxPrice,
        originalPrice: undefined,
        description: box.description,
        shortDescription: box.shortDescription,
        category: 'gift-boxes' as any,
        images: box.images,
        rating: 5,
        reviewCount: 0,
        material: 'Curated Set',
        weight: '',
        inStock: true,
        colors: [],
        tags: ['gift-box'],
      } satisfies Product,
      1,
      undefined,
      true,
      box.fixedItems,
      totalPrice
    );
    setAdded(true);
    setTimeout(() => router.push('/cart'), 800);
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-body text-xs text-burgundy/40">
          <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/gift-boxes" className="hover:text-burgundy transition-colors">Gift Boxes</Link>
          <ChevronRight size={12} />
          <span className="text-burgundy/70">{box.name}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left: Box hero image */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-28"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-square bg-champagne/30 shadow-2xl">
                <Image
                  src={box.images[0]}
                  alt={box.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-burgundy text-ivory font-ui text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Gift size={12} />
                    Curated Set
                  </span>
                </div>
              </div>

              {/* Gallery thumbnails */}
              {box.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {box.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-nude/40"
                    >
                      <Image src={img} alt={`${box.name} ${i + 1}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-3">
                {box.name}
              </h1>
              <p className="font-body text-burgundy/60 mb-6 leading-relaxed">
                {box.description}
              </p>

              {/* Notice */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-champagne/40 border border-nude/40 mb-8">
                <Info size={16} className="text-burgundy/60 mt-0.5 flex-shrink-0" />
                <p className="font-body text-sm text-burgundy/70">
                  This is a curated gift set. The items are pre-selected and cannot be changed.{' '}
                  <strong>You may choose the color variant for each piece below.</strong>
                </p>
              </div>

              {/* Items in box */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40">
                    Included in this box ({box.fixedItems.length} piece{box.fixedItems.length !== 1 ? 's' : ''})
                  </h2>
                </div>

                {/* Category filter tabs — only show if items span multiple categories */}
                {itemCategoryIds.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeCategory === 'all'
                          ? 'bg-burgundy text-ivory'
                          : 'bg-champagne/50 text-burgundy/60 hover:bg-champagne'
                      }`}
                    >
                      All
                    </button>
                    {itemCategoryIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => setActiveCategory(id)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                          activeCategory === id
                            ? 'bg-burgundy text-ivory'
                            : 'bg-champagne/50 text-burgundy/60 hover:bg-champagne'
                        }`}
                      >
                        {catName(id)}
                      </button>
                    ))}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {visibleItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-nude/30 hover:border-burgundy/20 transition-colors"
                      >
                        <Link href={`/shop/${item.id}`} target="_blank" className="flex-shrink-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/shop/${item.id}`} target="_blank">
                            <h3 className="font-ui font-semibold text-sm text-burgundy hover:text-wine transition-colors mb-0.5 line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="font-body text-xs text-burgundy/50 mb-2 line-clamp-1">
                            {item.shortDescription}
                          </p>
                          <p className="font-heading font-bold text-sm text-burgundy">
                            {formatPrice(item.price)}
                          </p>

                          {/* Color selector */}
                          {item.colors && item.colors.length > 0 && (
                            <div className="mt-3">
                              <p className="font-ui text-[10px] uppercase tracking-wider text-burgundy/40 mb-2">
                                Color
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {item.colors.map((color) => {
                                  const selected = colorSelections[item.id] === color;
                                  return (
                                    <button
                                      key={color}
                                      onClick={() => handleColorSelect(item.id, color)}
                                      title={color}
                                      className={`relative w-7 h-7 rounded-full border-2 transition-all ${
                                        selected
                                          ? 'border-burgundy scale-110 shadow-md'
                                          : 'border-transparent hover:border-burgundy/40'
                                      }`}
                                      style={{ backgroundColor: getSwatchColor(color) }}
                                    >
                                      {selected && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                          <Check size={10} className="text-white drop-shadow" />
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              {colorSelections[item.id] && (
                                <p className="font-body text-[10px] text-burgundy/50 mt-1 capitalize">
                                  Selected: {colorSelections[item.id]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pricing breakdown */}
              <div className="glass-card rounded-3xl p-6 mb-6">
                <h3 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40 mb-4">
                  Price Summary
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between font-body text-sm text-burgundy/60">
                    <span>Gift Box (packaging)</span>
                    <span>{formatPrice(box.boxPrice)}</span>
                  </div>
                  {box.fixedItems.map((item) => (
                    <div key={item.id} className="flex justify-between font-body text-sm text-burgundy/60">
                      <span className="truncate max-w-[200px]">{item.name}</span>
                      <span className="flex-shrink-0 ml-2">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-burgundy/10 flex justify-between items-center">
                  <span className="font-heading font-bold text-lg text-burgundy">Total</span>
                  <span className="font-heading font-bold text-2xl text-burgundy">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500 text-white font-ui font-semibold"
                  >
                    <Check size={18} />
                    Added to Cart! Redirecting…
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                  >
                    <ShoppingBag size={18} />
                    Add Gift Box to Cart
                  </motion.button>
                )}
              </AnimatePresence>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
                  `Hi! I'm interested in the ${box.name}. Can you help me with more details?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-green-500/40 bg-green-50 text-green-700 font-ui font-semibold text-sm hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={16} />
                Chat with us on WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
