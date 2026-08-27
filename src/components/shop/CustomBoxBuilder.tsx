'use client';
const emptyArray: any[] = [];
import { CustomBoxSidebar } from './CustomBoxSidebar';

import { useState, useMemo } from 'react';
import { m as motion, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
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
import { getProductColors } from '@/lib/colors';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

interface CustomBoxBuilderProps {
  baseBox: Product;
  allProducts: Product[];
  categories?: Category[];
}

export default function CustomBoxBuilder({
  baseBox,
  allProducts = emptyArray,
  categories = emptyArray,
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
      allProducts.reduce((acc: string[], p: any) => {
        if (p.category !== 'gift-boxes' && !String(p.category).includes('gift')) {
          acc.push(String(p.category));
        }
        return acc;
      }, [])
    );
    return Array.from(ids);
  }, [allProducts]);

  const availableProducts = useMemo(() => {
    return allProducts.filter(
      (p) => p.category !== 'gift-boxes' && !String(p.category).includes('gift') && (activeCategory === 'all' || String(p.category) === activeCategory)
    );
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
    <LazyMotion features={domAnimation}>
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
                className={`flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
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
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
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
                  const colorsInfo = getProductColors(product);
                  const activeColorObj = activeColors[product.id] 
                     ? colorsInfo.find(c => c.name === activeColors[product.id]) 
                     : colorsInfo[0];
                  
                  const activeColor = activeColorObj?.name;
                  
                  const totalCount = selectedItems.filter((i) => i.product.id === product.id).reduce((s, i) => s + i.quantity, 0);
                  const selectedCount =
                    selectedItems.find((i) => i.product.id === product.id && i.color === activeColor)?.quantity || 0;

                  // determine stock
                  let maxStock = product.quantity;
                  if (product.inventoryMode === 'color') {
                     maxStock = activeColorObj ? (activeColorObj.stock || 0) : 0;
                  }
                  
                  const isOOS = maxStock <= 0;
                  const canAddMore = selectedCount < maxStock;

                  return (
                    <div
                      key={product.id}
                      className={`relative group rounded-2xl p-3 border border-transparent transition-colors ${isOOS && selectedCount === 0 ? 'bg-gray-100 opacity-60' : 'bg-champagne/20 hover:border-burgundy/20'}`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-white">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className={`object-cover transition-transform duration-500 ${isOOS && selectedCount === 0 ? 'grayscale' : 'group-hover:scale-105'}`}
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
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-burgundy text-ivory flex items-center justify-center font-ui text-xs font-bold z-30 shadow-md">
                            {totalCount}
                          </div>
                        )}
                        {isOOS && selectedCount === 0 && (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-[10px] uppercase font-bold text-center py-1 rounded backdrop-blur-sm z-10">
                            Out of Stock
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
                        <div className="flex items-center gap-1 relative z-30">
                          {selectedCount > 0 && (
                            <button
                              aria-label="Remove item"
                              onClick={() => handleRemoveItem(product.id, activeColor)}
                              className="p-1.5 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                          )}
                          <button
                            aria-label="Add item"
                            onClick={() => {
                               if (canAddMore) {
                                  handleAddItem(product, activeColor);
                               }
                            }}
                            disabled={!canAddMore}
                            className={`p-1.5 rounded-full transition-colors ${!canAddMore ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory'}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {colorsInfo.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1.5 mt-2 relative z-30">
                          {colorsInfo.map((cInfo) => {
                            const isColorOOS = product.inventoryMode === 'color' && (cInfo.stock || 0) <= 0;
                            const isSelected = activeColor === cInfo.name;
                            const inCart = selectedItems.find((i) => i.product.id === product.id && i.color === cInfo.name)?.quantity || 0;
                            
                            return (
                              <button
                                key={cInfo.name}
                                onClick={() => setActiveColors(prev => ({ ...prev, [product.id]: cInfo.name }))}
                                disabled={isColorOOS && inCart === 0}
                                className={`w-4 h-4 rounded-full border border-burgundy/30 transition-all ${isSelected ? 'ring-2 ring-burgundy/50 ring-offset-1 ring-offset-champagne/20 scale-110' : ''} ${isColorOOS && inCart === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
                                style={{ backgroundColor: cInfo.hex || '#ccc' }}
                                title={`${cInfo.name}${isColorOOS && inCart === 0 ? ' (Out of Stock)' : ''}`}
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

          <CustomBoxSidebar
            baseBox={baseBox}
            selectedItems={selectedItems}
            flatBoxItems={flatBoxItems}
            boxItemsTotal={boxItemsTotal}
            totalBoxPrice={totalBoxPrice}
            added={added}
            handleRemoveItem={handleRemoveItem}
            handleAddItem={handleAddItem}
            handleAddToCart={handleAddToCart}
            buildWhatsAppMessage={buildWhatsAppMessage}
          />
        </div>
      </div>
    </div>
    </LazyMotion>
  );
}
