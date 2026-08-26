'use client';

import { useState, useMemo } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
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

import { NotAvailableBox } from './NotAvailableBox';
import { IncludedItemsList } from './IncludedItemsList';

interface ItemColorState {
  [productId: string]: string | undefined;
}

// ─── Main Viewer ─────────────────────────────────────────────────────────────
export default function FixedBoxViewer({ box, categories = [] }: FixedBoxViewerProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);
  const [colorSelections, setColorSelections] = useState<ItemColorState>({});
  const [added, setAdded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Unique category IDs from the fixed items
  const itemCategoryIds = useMemo(() => {
    const ids = new Set(box.fixedItems.map((p) => String(p.category)));
    return Array.from(ids);
  }, [box.fixedItems]);

  // Filtered items
  const visibleItems = useMemo(() => {
    if (activeCategory === 'all') return box.fixedItems;
    return box.fixedItems.filter((p) => String(p.category) === activeCategory);
  }, [activeCategory, box.fixedItems]);

  // Show "not available" if is_active is false
  if (!box.isActive) {
    return <NotAvailableBox name={box.name} />;
  }

  // Category name lookup
  const catName = (id: string) => {
    const found = categories.find((c) => c.id === id);
    if (found) return found.name;
    return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

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
        inStock: true, quantity: 1,
        colors: [],
        tags: ['gift-box'],
      } satisfies Product,
      1,
      undefined,
      true,
      box.fixedItems,
      totalPrice,
      'fixed',
      box.id
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
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      key={img}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-nude/40"
                    >
                      <Image src={img} alt={`${box.name} ${i + 1}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" unoptimized />
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
              <IncludedItemsList
                boxFixedItems={box.fixedItems}
                itemCategoryIds={itemCategoryIds}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                catName={catName}
                visibleItems={visibleItems}
                colorSelections={colorSelections}
                handleColorSelect={handleColorSelect}
              />

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
