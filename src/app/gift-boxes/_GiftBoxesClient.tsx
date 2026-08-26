'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Gift, Sparkles, ChevronRight } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import GiftBoxCard from '@/components/gift-boxes/GiftBoxCard';
import { getAllGiftBoxes } from '@/lib/data/gift-boxes';
import { useGiftBoxes } from '@/lib/hooks/use-gift-boxes';
import { GiftBox } from '@/types';

const FALLBACK_BOXES: Omit<GiftBox, 'id' | 'collectionId'>[] = [
  {
    name: 'Birthday Gift Box',
    slug: 'birthday-gift-box',
    type: 'birthday',
    description:
      'A beautifully curated collection of our finest pieces, perfectly assembled to make someone\'s birthday unforgettable. Wrapped with love and elegance.',
    shortDescription: 'Curated birthday jewelry set',
    boxPrice: 500,
    images: ['/placeholder.png'],
    fixedItems: [],
    isActive: true,
  },
  {
    name: 'Anniversary Gift Box',
    slug: 'anniversary-gift-box',
    type: 'anniversary',
    description:
      'Celebrate love and milestones with our handpicked anniversary jewelry set — timeless pieces that speak the language of devotion and beauty.',
    shortDescription: 'Curated anniversary jewelry set',
    boxPrice: 700,
    images: ['/placeholder.png'],
    fixedItems: [],
    isActive: true,
  },
  {
    name: 'Customize Gift Box',
    slug: 'customize-gift-box',
    type: 'custom',
    description:
      'Design your own perfect gift box. Choose any pieces from our collection and we\'ll package them beautifully for you. Chat with us for even more personalization options.',
    shortDescription: 'Build your own gift set',
    boxPrice: 400,
    images: ['/placeholder.png'],
    fixedItems: [],
    isActive: true,
  },
];



export default function GiftBoxesClient({ initialBoxes }: { initialBoxes: GiftBox[] }) {
  const { data: currentBoxes } = useGiftBoxes(initialBoxes);

  const activeBoxes = currentBoxes ?? initialBoxes;

  // Use PB data if available, otherwise fall back to static fallback structure for display
  const displayBoxes: GiftBox[] =
    activeBoxes.length > 0
      ? activeBoxes
      : FALLBACK_BOXES.map((b, i) => ({ ...b, id: `fallback-${i}` }));

  return (
    <PageWrapper>
      <div className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-10 font-body text-xs text-burgundy/40">
            <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-burgundy/70">Gift Boxes</span>
          </nav>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne border border-nude/60 font-ui text-xs font-semibold uppercase tracking-wider text-burgundy/70 mb-6">
              <Sparkles size={14} className="text-rose-gold" />
              The Perfect Gift Awaits
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-burgundy mb-4">
              Gift Boxes
            </h1>
            <p className="font-body text-lg text-burgundy/60 max-w-2xl mx-auto leading-relaxed">
              Whether it's a birthday, an anniversary, or a special someone — surprise them with
              a beautifully curated jewelry gift box from Yara.
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-rose-gold/40" />
              <Gift size={18} className="text-rose-gold" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-rose-gold/40" />
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
          >
            {[
              { step: '01', title: 'Choose a Box', desc: 'Select from our Birthday, Anniversary, or Customize options.' },
              { step: '02', title: 'Personalize', desc: 'Pick colors for fixed sets, or choose your own items for the custom box.' },
              { step: '03', title: 'Gift with Love', desc: 'We package everything beautifully. You just need to hand it over!' },
            ].map((item, i) => (
              <div
                key={item.step}
                className="text-center p-6 rounded-3xl bg-champagne/30 border border-nude/40"
              >
                <div className="font-heading text-4xl font-bold text-burgundy/10 mb-2">{item.step}</div>
                <h3 className="font-ui font-bold text-sm text-burgundy mb-1">{item.title}</h3>
                <p className="font-body text-xs text-burgundy/50">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Gift Box Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayBoxes.map((box, i) => (
              <GiftBoxCard key={box.id} box={box} index={i} />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center p-10 rounded-3xl bg-gradient-to-br from-burgundy to-wine text-ivory"
          >
            <h2 className="font-heading text-3xl font-bold mb-3">Need something extra special?</h2>
            <p className="font-body text-ivory/70 mb-6 max-w-lg mx-auto">
              Reach out to us on WhatsApp for fully custom orders, bulk gifting, and corporate packages.
            </p>
            <a
              href={`https://wa.me/94711831723?text=${encodeURIComponent('Hi! I\'d like to order a custom gift box from Yara.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-burgundy font-ui font-bold text-sm hover:bg-champagne transition-colors shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
