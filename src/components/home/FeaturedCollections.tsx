'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types';

export default function FeaturedCollections({ categories = [] }: { categories?: Category[] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Bento grid is designed for exactly 3 items
  const displayCategories = categories.slice(0, 3);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-3 block">
            Explore
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-burgundy mb-4">
            Our Collections
          </h2>
          <p className="font-body text-burgundy/50 max-w-lg mx-auto">
            Curated categories designed to help you find the perfect piece for every occasion.
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:auto-rows-[280px]">
          {displayCategories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`h-[300px] md:h-auto ${i === 0 ? 'md:col-span-2 md:row-span-2 sm:col-span-2' : ''}`}
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative block rounded-3xl overflow-hidden h-full w-full bg-champagne"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy/70 via-burgundy/20 to-transparent" />

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-rose-gold/0 group-hover:bg-rose-gold/10 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-heading text-xl sm:text-2xl font-semibold text-ivory mb-1">
                        {category.name}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-ivory/60 hidden sm:block max-w-[200px]">
                        {category.description}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-ivory/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-ivory/40 transition-colors flex-shrink-0"
                    >
                      <ArrowUpRight size={18} className="text-ivory" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
