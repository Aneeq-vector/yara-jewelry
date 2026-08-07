'use client';

import { m as motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getSwatchColor } from './color-utils';

interface IncludedItemsListProps {
  boxFixedItems: Product[];
  itemCategoryIds: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  catName: (id: string) => string;
  visibleItems: Product[];
  colorSelections: Record<string, string | undefined>;
  handleColorSelect: (productId: string, color: string) => void;
}

export function IncludedItemsList({
  boxFixedItems,
  itemCategoryIds,
  activeCategory,
  setActiveCategory,
  catName,
  visibleItems,
  colorSelections,
  handleColorSelect,
}: IncludedItemsListProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-ui font-bold text-xs uppercase tracking-wider text-burgundy/40">
          Included in this box ({boxFixedItems.length} piece{boxFixedItems.length !== 1 ? 's' : ''})
        </h2>
      </div>

      {/* Category filter tabs — only show if items span multiple categories */}
      {itemCategoryIds.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${
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
              className={`flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${
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
                    fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                            className={`relative w-7 h-7 rounded-full border-2 transition ${
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
  );
}
