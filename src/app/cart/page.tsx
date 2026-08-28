'use client';

import { getOptimizedImageUrl, isPocketBaseResizable , pbLoader } from '@/lib/image-utils';
import { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { useCategories } from '@/lib/hooks/use-categories';
export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getCartProductQuantity } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const { data: categories = [] } = useCategories();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : '';
  };

  const subtotal = getTotal();
  const FREE_DELIVERY_THRESHOLD = 10000;
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 450;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'YARA10') {
      setDiscount(Math.round(subtotal * 0.1));
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-champagne/50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-burgundy/30" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-burgundy mb-3">Your cart is empty</h1>
            <p className="font-body text-burgundy/50 mb-8">
              Looks like you haven&apos;t added anything yet. Explore our collection and find something you love.
            </p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              <span>Start Shopping</span>
              <ArrowRight size={16} className="relative z-10" />
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-burgundy mb-10"
          >
            Shopping Cart
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.cartItemId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="glass-card rounded-3xl p-4 sm:p-6"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image */}
                      <Link href={`/shop/${item.product.id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-champagne/30">
                          <Image
                            src={item.product.images[0]}
                            loader={isPocketBaseResizable(item.product.images[0]) ? pbLoader : undefined}
                            alt={item.product.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/shop/${item.product.id}`}>
                              <h3 className="font-ui font-semibold text-sm sm:text-base text-burgundy hover:text-wine transition-colors line-clamp-1">
                                {item.product.name}
                              </h3>
                            </Link>
                            {item.isCustomBox ? (
                              <div className="mt-1 space-y-1">
                                {item.boxItems?.slice(0, 3).map((boxItem) => (
                                  <p key={boxItem.id || boxItem.name} className="font-body text-xs text-burgundy/60">
                                    • {boxItem.name}{boxItem.selectedColor ? ` (${boxItem.selectedColor})` : ''}
                                  </p>
                                ))}
                                {(item.boxItems?.length || 0) > 3 && (
                                  <p className="font-body text-xs text-burgundy/40 italic">
                                    + {(item.boxItems?.length || 0) - 3} more items
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="font-body text-xs text-burgundy/40 capitalize mt-0.5">
                                {getCategoryName(item.product.category)}
                                {item.selectedColor && ` • Color: ${item.selectedColor}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            aria-label="Interactive control" className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-champagne/60 text-burgundy/40 hover:text-burgundy transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              aria-label="Interactive control" className="w-11 h-11 sm:w-8 sm:h-8 min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 rounded-lg border border-nude/50 flex items-center justify-center text-burgundy/50 hover:border-burgundy/30 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-10 text-center font-ui font-semibold text-sm text-burgundy">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                const res = updateQuantity(item.cartItemId, item.quantity + 1);
                                if (res && !res.success) {
                                  // Can optionally show toast here if needed
                                }
                              }}
                              disabled={!item.isCustomBox ? getCartProductQuantity(item.product.id) >= item.product.quantity : item.quantity >= item.product.quantity}
                              aria-label="Interactive control" className="w-11 h-11 sm:w-8 sm:h-8 min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 rounded-lg border border-nude/50 flex items-center justify-center text-burgundy/50 hover:border-burgundy/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="font-ui font-bold text-base text-burgundy">
                              {formatPrice((item.customPrice ?? item.product.price) * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="font-body text-[10px] text-burgundy/40">
                                {formatPrice(item.customPrice ?? item.product.price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card rounded-3xl p-6 sm:p-8 sticky top-28">
                <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Order Summary</h2>

                {/* Coupon */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/30" />
                    <label htmlFor="couponCode" className="sr-only">Coupon code</label>
                    <input
                      id="couponCode"
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-transparent border border-burgundy/20 font-body text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none focus:border-burgundy"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl bg-burgundy text-ivory font-ui text-xs font-semibold uppercase tracking-wider hover:bg-wine transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-emerald-600 font-ui text-xs font-semibold mb-4">
                    ✨ YARA10 applied! You saved {formatPrice(discount)}
                  </p>
                )}

                {/* Totals */}
                <div className="space-y-3 border-t border-nude/30 pt-4">
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-burgundy/50">Subtotal</span>
                    <span className="font-ui font-semibold text-sm text-burgundy">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-emerald-600">Discount</span>
                      <span className="font-ui font-semibold text-sm text-emerald-600">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-burgundy/50">Delivery</span>
                    <span className="font-ui font-semibold text-sm text-burgundy">
                      {shipping === 0 ? (
                        <span className="flex items-center gap-2">
                          <span className="line-through text-burgundy/40 opacity-70">Rs. 450</span>
                          <span>Free</span>
                        </span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-nude/30">
                    <span className="font-ui font-bold text-base text-burgundy">Total</span>
                    <span className="font-ui font-bold text-xl text-burgundy">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} className="relative z-10" />
                </Link>

                <p className="font-body text-xs text-burgundy/60 text-center mt-4">
                  {shipping === 0 
                    ? "✨ Free delivery unlocked for orders over Rs. 10,000!" 
                    : `Orders over Rs. 10,000 are eligible for free delivery.`}
                </p>


              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
