import React from 'react';
import Image from 'next/image';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Check, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

export function CustomBoxSidebar({
  baseBox,
  selectedItems,
  flatBoxItems,
  boxItemsTotal,
  totalBoxPrice,
  added,
  handleRemoveItem,
  handleAddItem,
  handleAddToCart,
  buildWhatsAppMessage
}: any) {
  return (
          <>
          {/* Right: Box Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 sticky top-28">
              <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Your Box</h2>

              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-burgundy/10">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={baseBox.images[0]}
                    alt={baseBox.name}
                    fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  <div>
                    {selectedItems.map((item: any) => (
                      <motion.div
                        key={`${item.product.id}-${item.color || 'none'}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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
                            aria-label="Remove item"
                            onClick={() => handleRemoveItem(item.product.id, item.color)}
                            className="p-1 rounded bg-ivory text-burgundy/60 hover:text-burgundy"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-ui text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Add item"
                            onClick={() => handleAddItem(item.product, item.color)}
                            className="p-1 rounded bg-ivory text-burgundy/60 hover:text-burgundy"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
              <div>
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
              </div>

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

  </>
  );
}
