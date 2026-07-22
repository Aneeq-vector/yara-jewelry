'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Gift,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

interface CustomBoxBuilderProps {
  baseBox: Product;
  allProducts: Product[];
  categories?: Category[];
}

export default function CustomBoxBuilder({
  baseBox,
  allProducts = [],
  categories = [],
}: CustomBoxBuilderProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number; color?: string }[]>([]);
  const [activeColors, setActiveColors] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);

  // Map category id → display name
  const categoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Unique category IDs present in non-gift-box products
  const categoryIds = useMemo(() => {
    const ids = new Set(
      allProducts
        .filter((p) => p.category !== 'gift-boxes' && !String(p.category).includes('gift'))
        .map((p) => String(p.category))
    );
    return Array.from(ids);
  }, [allProducts]);

  const availableProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.category !== 'gift-boxes' && !String(p.category).includes('gift'))
      .filter((p) => activeCategory === 'all' || String(p.category) === activeCategory);
  }, [activeCategory, allProducts]);

  const handleAddItem = (product: Product, color?: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.color === color);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.color === color ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, color }];
    });
  };

  const handleRemoveItem = (productId: string, color?: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId && item.color === color);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId && item.color === color ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => !(item.product.id === productId && item.color === color));
    });
  };

  const boxItemsTotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalBoxPrice = baseBox.price + boxItemsTotal;
  const flatBoxItems = selectedItems.flatMap((item) => Array(item.quantity).fill({ ...item.product, selectedColor: item.color }));

  const handleAddToCart = () => {
    addToCart(baseBox, 1, undefined, true, flatBoxItems, totalBoxPrice);
    setAdded(true);
    setTimeout(() => router.push('/cart'), 800);
  };

  const buildWhatsAppMessage = () => {
    let msg = `Hi! I'd like to customize a Gift Box from Yara.\n\nSelected items:\n`;
    if (selectedItems.length === 0) {
      msg += '(No items selected yet — I need help choosing!)\n';
    } else {
      selectedItems.forEach((item) => {
        msg += `• ${item.product.name} x${item.quantity} – ${formatPrice(item.product.price * item.quantity)}\n`;
      });
    }
    msg += `\nBox & packaging: ${formatPrice(baseBox.price)}\nTotal: ${formatPrice(totalBoxPrice)}\n\nCan you help me finalize this?`;
    return encodeURIComponent(msg);
  };

  // Label for a category tab
  const getCategoryLabel = (id: string) => {
    if (id === 'all') return 'All Items';
    // Try exact match from map
    if (categoryIdToName[id]) return categoryIdToName[id];
    // Fallback: humanize the id/slug
    return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-body text-xs text-burgundy/40">
          <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/gift-boxes" className="hover:text-burgundy transition-colors">Gift Boxes</Link>
          <ChevronRight size={12} />
          <span className="text-burgundy/70 truncate max-w-[200px]">{baseBox.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left/Center: Selection Area */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={22} className="text-amber-500" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy">
                  Build Your Gift Box
                </h1>
              </div>
              <p className="font-body text-burgundy/60 mb-3">{baseBox.description}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-ui text-sm font-semibold">
                <Gift size={14} />
                Box & packaging fee: {formatPrice(baseBox.price)} (fixed)
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-burgundy text-ivory'
                    : 'bg-champagne/50 text-burgundy/60 hover:bg-champagne'
                }`}
              >
                All Items
              </button>

              {categoryIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeCategory === id
                      ? 'bg-burgundy text-ivory'
                      : 'bg-champagne/50 text-burgundy/60 hover:bg-champagne'
                  }`}
                >
                  {getCategoryLabel(id)}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6"
              >
                {availableProducts.map((product) => {
                  const activeColor = activeColors[product.id] || product.colors?.[0] || undefined;
                  const totalCount = selectedItems.filter((i) => i.product.id === product.id).reduce((s, i) => s + i.quantity, 0);
                  const selectedCount =
                    selectedItems.find((i) => i.product.id === product.id && i.color === activeColor)?.quantity || 0;

                  return (
                    <div
                      key={product.id}
                      className="relative group bg-champagne/20 rounded-2xl p-3 border border-transparent hover:border-burgundy/20 transition-all"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <Link
                          href={`/shop/${product.id}`}
                          target="_blank"
                          className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-ivory font-ui text-xs font-bold uppercase tracking-wider backdrop-blur-[2px] z-20"
                        >
                          View details
                        </Link>
                        {totalCount > 0 && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-burgundy text-ivory flex items-center justify-center font-ui text-xs font-bold z-30">
                            {totalCount}
                          </div>
                        )}
                      </div>
                      <h3 className="font-ui font-semibold text-xs text-burgundy line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-body font-bold text-sm text-burgundy">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          {selectedCount > 0 && (
                            <button
                              onClick={() => handleRemoveItem(product.id, activeColor)}
                              className="p-1.5 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleAddItem(product, activeColor)}
                            className="p-1.5 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {product.colors.map((c) => {
                            const l = c.toLowerCase();
                            const cssColor = l === 'gold' ? '#FFD700' : l === 'silver' ? '#C0C0C0' : l === 'rose gold' ? '#B76E79' : l === 'platinum' ? '#E5E4E2' : l === 'black' ? '#222222' : c;
                            return (
                              <button
                                key={c}
                                onClick={() => setActiveColors(prev => ({ ...prev, [product.id]: c }))}
                                className={`w-4 h-4 rounded-full border border-burgundy/20 ${activeColor === c ? 'ring-2 ring-burgundy/50 ring-offset-1 ring-offset-champagne/20' : ''}`}
                                style={{ backgroundColor: cssColor }}
                                title={c}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Box Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 sticky top-28">
              <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Your Box</h2>

              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-burgundy/10">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={baseBox.images[0]}
                    alt={baseBox.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-ui font-semibold text-sm text-burgundy">{baseBox.name}</h3>
                  <span className="font-body text-sm text-burgundy/60">
                    {formatPrice(baseBox.price)}
                  </span>
                </div>
              </div>

              {/* Selected Items */}
              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto no-scrollbar">
                {selectedItems.length === 0 ? (
                  <p className="font-body text-sm text-burgundy/40 text-center py-4">
                    Your box is empty. Select items to add!
                  </p>
                ) : (
                  <AnimatePresence>
                    {selectedItems.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.color || 'none'}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-ui font-semibold text-xs text-burgundy line-clamp-1">
                            {item.product.name}{item.color ? ` (${item.color})` : ''}
                          </p>
                          <p className="font-body text-xs text-burgundy/60">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-champagne/50 rounded-lg p-1 flex-shrink-0">
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.color)}
                            className="p-1 rounded bg-ivory text-burgundy/60 hover:text-burgundy"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-ui text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(item.product, item.color)}
                            className="p-1 rounded bg-ivory text-burgundy/60 hover:text-burgundy"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-burgundy/10 mb-6">
                <div className="flex justify-between font-body text-sm text-burgundy/60">
                  <span>Box & packaging</span>
                  <span>{formatPrice(baseBox.price)}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-burgundy/60">
                  <span>Items ({flatBoxItems.length})</span>
                  <span>{formatPrice(boxItemsTotal)}</span>
                </div>
                <div className="flex justify-between font-heading font-bold text-xl text-burgundy pt-3 border-t border-burgundy/10">
                  <span>Total</span>
                  <span>{formatPrice(totalBoxPrice)}</span>
                </div>
              </div>

              {/* Add to Cart */}
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-ui font-semibold mb-3"
                  >
                    <Check size={16} />
                    Added! Redirecting…
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    disabled={selectedItems.length === 0}
                    className="btn-primary w-full flex items-center justify-center gap-2 mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={16} />
                    <span>Add Box to Cart</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-green-500/40 bg-green-50 text-green-700 font-ui text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
              <p className="font-body text-[10px] text-burgundy/40 text-center mt-2">
                Need more customization? We're here to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
