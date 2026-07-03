'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { products } from '@/lib/data/products';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CustomBoxBuilderProps {
  baseBox: Product;
}

export default function CustomBoxBuilder({ baseBox }: CustomBoxBuilderProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const addToCart = useCartStore((s) => s.addItem);

  const availableProducts = useMemo(() => {
    let filtered = products.filter((p) => p.category !== 'gift-boxes');
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    return filtered;
  }, [activeCategory]);

  const categories = useMemo(() => {
    const cats = new Set(products.filter((p) => p.category !== 'gift-boxes').map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const handleAddItem = (product: Product) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const boxItemsTotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalBoxPrice = baseBox.price + boxItemsTotal;
  const flatBoxItems = selectedItems.flatMap(item => Array(item.quantity).fill(item.product));

  const handleAddToCart = () => {
    // Add to cart as a custom box
    addToCart(
      baseBox,
      1,
      undefined,
      true, // isCustomBox
      flatBoxItems,
      totalBoxPrice
    );
    router.push('/cart');
  };

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-body text-xs text-burgundy/40">
          <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-burgundy transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${baseBox.category}`} className="hover:text-burgundy transition-colors capitalize">
            {baseBox.category.replace('-', ' ')}
          </Link>
          <ChevronRight size={12} />
          <span className="text-burgundy/70 truncate max-w-[200px]">{baseBox.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left/Center: Selection Area */}
          <div className="lg:col-span-2">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-4">
              Build Your Gift Box
            </h1>
            <p className="font-body text-burgundy/60 mb-8">
              {baseBox.description}
            </p>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`cursor-pointer flex-shrink-0 px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-burgundy text-ivory'
                      : 'bg-champagne/50 text-burgundy/60 hover:bg-champagne'
                  }`}
                >
                  {cat === 'all' ? 'All Items' : cat.replace('-', ' ')}
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
                  const selectedCount = selectedItems.find((i) => i.product.id === product.id)?.quantity || 0;
                  
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
                      />
                      <Link 
                        href={`/shop/${product.slug}`} 
                        target="_blank" 
                        className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-ivory font-ui text-xs font-bold uppercase tracking-wider backdrop-blur-[2px] z-20"
                      >
                        Click to view
                      </Link>
                      {selectedCount > 0 && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-burgundy text-ivory flex items-center justify-center font-ui text-xs font-bold z-30">
                          {selectedCount}
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
                      <button
                        onClick={() => handleAddItem(product)}
                        className="p-1.5 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
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
                  <Image src={baseBox.images[0]} alt={baseBox.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-ui font-semibold text-sm text-burgundy">{baseBox.name}</h3>
                  <span className="font-body text-sm text-burgundy/60">{formatPrice(baseBox.price)}</span>
                </div>
              </div>

              {/* Selected Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
                {selectedItems.length === 0 ? (
                  <p className="font-body text-sm text-burgundy/40 text-center py-4">
                    Your box is empty. Select items to add!
                  </p>
                ) : (
                  <AnimatePresence>
                    {selectedItems.map((item) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-ui font-semibold text-xs text-burgundy line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="font-body text-xs text-burgundy/60">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-champagne/50 rounded-lg p-1">
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-1 rounded bg-ivory text-burgundy/60 hover:text-burgundy"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-ui text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(item.product)}
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
                  <span>Box Price</span>
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

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                <span>Add Box to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
