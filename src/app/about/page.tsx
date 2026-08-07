'use client';

import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Gem, Sparkles, Target } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import WhyChooseYara from '@/components/home/WhyChooseYara';

const values = [
  { icon: Gem, title: 'Premium Craftsmanship', description: 'Each piece is meticulously crafted with attention to the finest details, ensuring a premium finish that rivals fine jewelry.' },
  { icon: Heart, title: 'Designed with Love', description: 'Our designs are born from a passion for beauty and a deep understanding of modern women who appreciate elegance.' },
  { icon: Sparkles, title: 'Trendsetting Style', description: 'We stay ahead of global fashion trends, bringing you designs that are fresh, modern, and utterly fashion-forward.' },
  { icon: Target, title: 'Accessible Luxury', description: 'We believe every woman deserves to feel luxurious. Our pricing makes premium jewelry accessible to all.' },
];

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="pt-24">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 gradient-hero overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-rose-gold/10 blur-[120px]"
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-4 block">Our Story</span>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-burgundy mb-6">
                Crafted For <span className="gradient-text-rose italic">Elegance</span>
              </h1>
              <p className="font-editorial text-xl sm:text-2xl text-burgundy/60 italic max-w-2xl mx-auto leading-relaxed">
                Yara was born from a simple belief — that every woman deserves to feel extraordinary, every single day.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="section-padding">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative rounded-3xl overflow-hidden w-full pb-[125%]">
                  <Image
                    src="https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=750&fit=crop"
                    alt="Yara jewelry collection"
                    fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="absolute inset-0 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy/20 to-transparent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-4 block">Brand Story</span>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-6">
                  Where Elegance Meets Modern Fashion
                </h2>
                <div className="space-y-4 font-body text-burgundy/60 leading-relaxed">
                  <p>
                    Yara began with a vision — to create jewelry that doesn&apos;t just accessorize but transforms. We noticed a gap between luxury fine jewelry and mass-produced fashion jewelry, and we set out to bridge it.
                  </p>
                  <p>
                    Every Yara piece is designed with the modern woman in mind. Someone who appreciates quality, follows global trends, and believes that luxury should be part of everyday life — not reserved for special occasions.
                  </p>
                  <p>
                    Our collections draw inspiration from international runways, editorial fashion, and the timeless beauty of nature. Each design undergoes rigorous quality checks and a meticulous finishing process to ensure it meets our premium standards.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-champagne/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-3xl p-8 sm:p-10"
              >
                <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-4 block">Mission</span>
                <h3 className="font-heading text-2xl font-bold text-burgundy mb-4">
                  Redefining Accessible Luxury
                </h3>
                <p className="font-body text-burgundy/60 leading-relaxed">
                  To create premium imitation jewelry that empowers women to express their unique style without compromise. We aim to make luxury accessible, sustainable, and deeply personal.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-3xl p-8 sm:p-10"
              >
                <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-4 block">Vision</span>
                <h3 className="font-heading text-2xl font-bold text-burgundy mb-4">
                  The Future of Fashion Jewelry
                </h3>
                <p className="font-body text-burgundy/60 leading-relaxed">
                  To become the most loved fashion jewelry brand — one that women trust for quality, turn to for inspiration, and choose for every moment that matters.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values - Replaced with the global WhyChooseYara component */}
        <WhyChooseYara />
      </div>
    </PageWrapper>
  );
}
