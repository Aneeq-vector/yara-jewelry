import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Star, Ruler, ShoppingBag, Loader2, Heart, Share2, Truck, RotateCcw, Shield, AlertCircle, Minus, Plus } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { getProductColors } from '@/lib/colors';
import { Product } from '@/types';
import { BRAND } from '@/lib/constants';

export function ProductInfo({ 
  product, categoryName, selectedColor, setSelectedColor, quantity, setQuantity, 
  handleAddToCart, isAdding, toggleItem, wishlisted, setIsSizeGuideOpen, addError 
}: any) {
  const [showSticky, setShowSticky] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky footer only when the main CTA is out of view (user scrolled down)
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' } 
    );
    if (mainCtaRef.current) {
      observer.observe(mainCtaRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
              <span className="font-ui text-xs font-semibold uppercase tracking-[0.15em] text-rose-gold mb-3 block">
                {categoryName || product.category.replace('-', ' ')}
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

                            {/* Computed Inventory */}
              {(() => {
                const colorsInfo = getProductColors(product);
                const hasColors = colorsInfo.length > 0;
                let isGlobalOOS = false;
                let activeColorObj = null;
                
                if (product.inventoryMode === 'color') {
                   isGlobalOOS = colorsInfo.reduce((sum, c) => sum + (c.stock || 0), 0) <= 0;
                   activeColorObj = colorsInfo.find(c => c.name === selectedColor) || colorsInfo[0];
                } else {
                   isGlobalOOS = product.quantity <= 0;
                }
                
                const isVariantOOS = product.inventoryMode === 'color' && activeColorObj && (activeColorObj.stock || 0) <= 0;

                return (
                  <>
                    {/* Out of Stock Alert */}
                    {isGlobalOOS && (
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
                    {hasColors && (
                      <div className="mb-8">
                        <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-3">
                          Color: {selectedColor || colorsInfo[0].name}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {colorsInfo.map((cInfo) => {
                            const isSelected = (selectedColor || colorsInfo[0].name) === cInfo.name;
                            const isColorOOS = product.inventoryMode === 'color' && (cInfo.stock || 0) <= 0;
                            
                            return (
                              <button
                                key={cInfo.name}
                                onClick={() => !isColorOOS && setSelectedColor(cInfo.name)}
                                disabled={isColorOOS}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-ui text-sm transition ${
                                  isSelected
                                    ? 'border-burgundy bg-burgundy text-ivory font-semibold shadow-md'
                                    : 'border-nude/50 text-burgundy/60 hover:border-burgundy/30 hover:bg-white'
                                } ${isColorOOS ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                              >
                                {cInfo.hex && (
                                   <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: cInfo.hex }}></span>
                                )}
                                <span>{cInfo.name}</span>
                                {isColorOOS && <span className="text-[10px] ml-1 uppercase tracking-wide opacity-80">(Out)</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Add Error Alert */}
              <AnimatePresence>
                {addError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-8"
                  >
                    <Alert variant="destructive" className="bg-red-50 py-3 flex items-center gap-3 border-red-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                      <AlertDescription className="text-red-700 text-sm font-semibold">
                        {addError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

{/* Computed Actions & Quantity */}
              {(() => {
                const colorsInfo = getProductColors(product);
                const hasColors = colorsInfo.length > 0;
                let maxStock = product.quantity;
                let activeColorObj = null;
                
                if (product.inventoryMode === 'color') {
                   activeColorObj = colorsInfo.find(c => c.name === selectedColor) || colorsInfo[0];
                   maxStock = activeColorObj ? (activeColorObj.stock || 0) : 0;
                }
                
                const isOOS = maxStock <= 0;

                return (
                  <>
                    {/* Quantity */}
                    {!isOOS && (
                      <div className="mb-8">
                        <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-3">
                          Quantity
                        </h4>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            aria-label="Interactive control" className="w-10 h-10 rounded-xl border border-nude/50 flex items-center justify-center text-burgundy/60 hover:border-burgundy/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center font-ui font-semibold text-burgundy">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(Math.min(quantity + 1, maxStock))}
                            disabled={quantity >= maxStock}
                            aria-label="Interactive control" className="w-10 h-10 rounded-xl border border-nude/50 flex items-center justify-center text-burgundy/60 hover:border-burgundy/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div ref={mainCtaRef} className="flex gap-3 mb-8">
                      {!isOOS ? (
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
                            `Hi! I'm interested in the "${product.name}"${hasColors ? ` (Color: ${selectedColor || colorsInfo[0].name})` : ''} which is currently out of stock. Could you let me know when it will be restocked?`
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
                        className={`p-4 rounded-full border transition ${
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
                    
                    {/* Mobile Sticky Add to Cart Footer */}
                    <AnimatePresence>
                      {!isOOS && showSticky && (
                        <motion.div
                          initial={{ y: 100 }}
                          animate={{ y: 0 }}
                          exit={{ y: 100 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="fixed bottom-0 left-0 right-0 p-4 bg-ivory/95 backdrop-blur-md border-t border-nude/30 z-[60] lg:hidden flex items-center justify-between gap-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]"
                        >
                          <div className="flex flex-col">
                            <span className="font-ui font-bold text-lg text-burgundy leading-none mb-1">{formatPrice(product.price)}</span>
                            {(product.originalPrice || 0) > 0 && (
                              <span className="font-body text-xs text-burgundy/40 line-through leading-none">{formatPrice(product.originalPrice || 0)}</span>
                            )}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="btn-primary flex-1 max-w-[200px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed py-3.5"
                          >
                            {isAdding ? (
                              <Loader2 size={16} className="animate-spin relative z-10" />
                            ) : (
                              <ShoppingBag size={16} className="relative z-10" />
                            )}
                            <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}


              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Truck, label: 'Free Shipping', sub: 'Orders above Rs. 4,999' },
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
              
              

    </>
  );
}
