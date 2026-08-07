'use client';

import { m as motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

const images = [
  { src: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=500&fit=crop', span: 'tall' },
  { src: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=350&fit=crop', span: 'normal' },
  { src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=450&fit=crop', span: 'tall' },
  { src: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=350&fit=crop', span: 'normal' },
  { src: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=500&fit=crop', span: 'tall' },
  { src: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop', span: 'normal' },
  { src: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=350&fit=crop', span: 'normal' },
  { src: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=450&fit=crop', span: 'tall' },
];

export default function FashionInspiration() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section ref={sectionRef} className="section-padding bg-champagne/20 relative overflow-hidden">
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
            Get Inspired
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-burgundy mb-4">
            Fashion Inspiration
          </h2>
          <p className="font-body text-burgundy/50 max-w-lg mx-auto">
            Explore styling ideas and discover how to wear Yara pieces for every occasion.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="break-inside-avoid group cursor-pointer inline-block w-full mb-4"
            >
              <Link href="/shop" className="block relative rounded-2xl overflow-hidden">
                <Image
                  src={img.src}
                  alt={`Fashion inspiration ${i + 1}`}
                  width={400}
                  height={img.span === 'tall' ? 500 : 350}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-4 py-2 rounded-full glass font-ui text-xs font-semibold uppercase tracking-wider text-burgundy">
                    Shop The Look
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
