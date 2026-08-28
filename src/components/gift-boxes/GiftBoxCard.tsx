'use client';

import { getOptimizedImageUrl, isPocketBaseResizable , pbLoader } from '@/lib/image-utils';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Gift, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { GiftBox } from '@/types';
import { formatPrice } from '@/lib/utils';

const TYPE_CONFIG = {
  birthday: {
    icon: <Sparkles size={22} />,
    tag: 'Birthday',
    gradient: 'from-rose-400/20 via-pink-300/10 to-fuchsia-400/20',
    borderGlow: 'hover:shadow-rose-200/60',
    accentColor: 'text-rose-500',
    tagBg: 'bg-rose-50 text-rose-600 border-rose-200',
    btnClass: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
    ribbon: '🎂',
  },
  anniversary: {
    icon: <Heart size={22} />,
    tag: 'Anniversary',
    gradient: 'from-burgundy/10 via-rose-gold/10 to-pink-400/10',
    borderGlow: 'hover:shadow-burgundy/20',
    accentColor: 'text-burgundy',
    tagBg: 'bg-champagne text-burgundy border-nude',
    btnClass: 'bg-gradient-to-r from-burgundy to-wine hover:from-wine hover:to-burgundy',
    ribbon: '💍',
  },
  custom: {
    icon: <Gift size={22} />,
    tag: 'Customize',
    gradient: 'from-amber-400/15 via-rose-gold/10 to-orange-300/15',
    borderGlow: 'hover:shadow-amber-200/60',
    accentColor: 'text-amber-600',
    tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
    btnClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    ribbon: '✨',
  },
} as const;

const TYPE_HREF: Record<string, string> = {
  custom: '/gift-boxes/customize',
};

interface GiftBoxCardProps {
  box: GiftBox;
  index: number;
}

export default function GiftBoxCard({ box, index }: GiftBoxCardProps) {
  const config = TYPE_CONFIG[box.type];
  const href = TYPE_HREF[box.type] || `/gift-boxes/${box.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="h-full"
    >
      <Link href={href} className="block group h-full">
        <div
          className={`relative rounded-3xl overflow-hidden border border-nude/40 bg-gradient-to-br ${config.gradient} shadow-xl ${config.borderGlow} hover:shadow-2xl transition duration-500 h-full flex flex-col`}
        >


          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={box.images[0]}
              loader={isPocketBaseResizable(box.images[0]) ? pbLoader : undefined}
              alt={box.name}
              fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1">
            {/* Tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider border ${config.tagBg} mb-4 self-start`}
            >
              {config.icon}
              {config.tag}
            </span>

            <h2 className="font-heading text-2xl font-bold text-burgundy mb-2 group-hover:text-wine transition-colors">
              {box.name}
            </h2>
            <p className="font-body text-sm text-burgundy/60 mb-5 line-clamp-2 flex-1">
              {box.description}
            </p>

            {/* Price & CTA */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs text-burgundy/40 uppercase tracking-wider mb-0.5">
                  {box.type === 'custom' ? 'Box from' : 'Starting at'}
                </p>
                <p className="font-heading text-xl font-bold text-burgundy">
                  {formatPrice(box.boxPrice)}
                </p>
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-ui text-sm font-semibold shadow-lg transition ${config.btnClass}`}
              >
                Explore
                <ArrowRight size={14} />
              </motion.div>
            </div>

            {/* Fixed items preview (for birthday/anniversary) */}
            {box.type !== 'custom' && box.fixedItems.length > 0 && (
              <div className="mt-5 pt-4 border-t border-burgundy/10">
                <p className="font-ui text-[10px] uppercase tracking-wider text-burgundy/40 mb-2">
                  Includes {box.fixedItems.length} curated piece{box.fixedItems.length !== 1 ? 's' : ''}
                </p>
                <div className="flex -space-x-2">
                  {box.fixedItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm"
                    >
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        />
                    </div>
                  ))}
                  {box.fixedItems.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-champagne flex items-center justify-center text-[9px] font-bold text-burgundy shadow-sm">
                      +{box.fixedItems.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}

            {box.type === 'custom' && (
              <div className="mt-5 pt-4 border-t border-burgundy/10">
                <p className="font-ui text-[10px] uppercase tracking-wider text-burgundy/40 mb-2">
                  Full Customization
                </p>
                <div className="flex items-center gap-2 h-8">
                  <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                  <p className="font-body text-[11px] text-burgundy/50 leading-tight">
                    Pick your own items. WhatsApp support available for assistance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
