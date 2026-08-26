'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { searchProducts } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = ['Pearl Earrings', 'Gold Hoops', 'Layered Necklace', 'Stacking Rings', 'Bridal Set'];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (query.length > 1) {
      timeout = setTimeout(() => {
        searchProducts(query).then(setResults);
      }, 300);
    } else {
      setResults([]);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen && inputRef.current) {
      timeout = setTimeout(() => inputRef.current?.focus(), 200);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-burgundy/30 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl mx-auto mt-20 sm:mt-28 mx-4"
          >
            <div className="glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-burgundy/20">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-nude/30">
                <Search size={20} className="text-burgundy/50" />
                <input aria-label="Search for earrings, necklaces, rings..."
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for earrings, necklaces, rings..."
                  className="flex-1 bg-transparent text-burgundy font-body text-base placeholder:text-burgundy/35 focus:outline-none"
                />
                <button aria-label="Action" onClick={handleClose} className="p-2 sm:p-3 rounded-full bg-nude/30 text-burgundy hover:bg-nude/50 transition-colors">
                  <X size={18} className="text-burgundy/60" />
                </button>
              </div>

              {/* Results or Suggestions */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {results.length > 0 ? (
                  <div>
                    <p className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/40 mb-4">
                      {results.length} result{results.length > 1 ? 's' : ''} found
                    </p>
                    <div className="space-y-3">
                      {results.slice(0, 6).map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={`/shop/${product.id}`}
                            onClick={handleClose}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-champagne/40 transition-colors group"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-champagne flex-shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-ui font-semibold text-sm text-burgundy truncate">
                                {product.name}
                              </h4>
                              <p className="font-body text-xs text-burgundy/50 capitalize">
                                {product.category.replace('-', ' ')}
                              </p>
                            </div>
                            <span className="font-ui font-bold text-sm text-burgundy">
                              {formatPrice(product.price)}
                            </span>
                            <ArrowRight size={16} className="text-burgundy/30 group-hover:text-burgundy transition-colors" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    {results.length > 6 && (
                      <Link
                        href={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={onClose}
                        className="block mt-4 text-center py-3 rounded-xl bg-champagne/40 font-ui text-sm font-semibold text-burgundy hover:bg-champagne/60 transition-colors"
                      >
                        View all {results.length} results →
                      </Link>
                    )}
                  </div>
                ) : query.length > 1 ? (
                  <div className="text-center py-8">
                    <p className="font-body text-burgundy/50">No results found for &quot;{query}&quot;</p>
                    <p className="font-body text-sm text-burgundy/35 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div>
                    {/* Trending Searches */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-rose-gold" />
                        <span className="font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/40">
                          Trending Searches
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-4 py-2 rounded-full bg-champagne/60 font-body text-sm text-burgundy/70 hover:bg-champagne hover:text-burgundy transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
