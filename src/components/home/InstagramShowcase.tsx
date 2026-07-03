'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { BRAND } from '@/lib/constants';

const posts = [
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=300&h=300&fit=crop',
];

export default function InstagramShowcase() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-3 block">
            @yarajewelry
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-burgundy mb-4">
            Follow Our Journey
          </h2>
          <p className="font-body text-burgundy/50">
            Tag us to get featured. Join 50K+ styling enthusiasts.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {posts.map((src, i) => (
            <motion.a
              key={i}
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Instagram post ${i + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <InstagramIcon size={24} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <InstagramIcon size={16} />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
