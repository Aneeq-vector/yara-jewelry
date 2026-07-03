'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Gem, Feather, Sparkles, Crown } from 'lucide-react';

const features = [
  {
    icon: Gem,
    title: 'Premium Craftsmanship',
    description: 'Each piece is meticulously crafted with attention to the finest details, ensuring a premium finish that rivals fine jewelry.',
    color: '#9b3a5a',
    bg: '#9b3a5a12',
  },
  {
    icon: Feather,
    title: 'Designed with Love',
    description: 'Our designs are born from a passion for beauty and a deep understanding of modern women who appreciate elegance.',
    color: '#c9856a',
    bg: '#c9856a12',
  },
  {
    icon: Sparkles,
    title: 'Trendsetting Style',
    description: 'We stay ahead of global fashion trends, bringing you designs that are fresh, modern, and utterly fashion-forward.',
    color: '#9b3a5a',
    bg: '#9b3a5a12',
  },
  {
    icon: Crown,
    title: 'Accessible Luxury',
    description: 'We believe every woman deserves to feel luxurious. Our pricing makes premium jewelry accessible to all.',
    color: '#c9856a',
    bg: '#c9856a12',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative flex gap-6"
    >
      {/* Left: Icon column + connector line */}
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10"
          style={{ background: feature.bg, border: `1px solid ${feature.color}30` }}
        >
          <Icon size={22} style={{ color: feature.color }} strokeWidth={1.5} />
        </div>
        {/* vertical line connector (not on last item) */}
        {index < features.length - 1 && (
          <motion.div
            className="w-px flex-1 mt-3"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.12 + 0.3 }}
            style={{ transformOrigin: 'top', background: `linear-gradient(to bottom, ${feature.color}40, transparent)` }}
          />
        )}
      </div>

      {/* Right: Content */}
      <div className="pb-10">
        <h3 className="font-heading text-xl font-bold text-[#4a1c27] mb-2 leading-snug">
          {feature.title}
        </h3>
        <p className="font-body text-sm text-[#4a1c27]/55 leading-relaxed max-w-sm">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function WhyChooseYara() {
  return (
    <section className="py-24 bg-[#fdf9f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — Sticky Header */}
          <div className="">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-8 bg-[#c9856a]" />
              <span className="font-ui text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9856a]">
                Why Yara
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl font-bold text-[#4a1c27] leading-[1.05] mb-6"
            >
              What Sets Us<br />
              <span className="italic text-[#c9856a]">Apart</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-sm text-[#4a1c27]/50 leading-relaxed max-w-xs"
            >
              We believe luxury jewelry should be accessible, comfortable, and designed for the modern woman.
            </motion.p>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 hidden lg:grid grid-cols-2 gap-3"
            >
              {[
                { value: '10K+', label: 'Happy Customers' },
                { value: '200+', label: 'Unique Styles' },
                { value: '4.8★', label: 'Avg. Rating' },
                { value: '2021', label: 'Est. Since' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.07 }}
                  className="rounded-2xl px-4 py-4 border border-[#c9856a]/15"
                  style={{ background: 'linear-gradient(135deg, #c9856a08, #9b3a5a05)' }}
                >
                  <div className="font-heading text-2xl font-bold text-[#9b3a5a] leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="font-ui text-[10px] uppercase tracking-widest text-[#4a1c27]/45">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Vertical Feature Timeline */}
          <div className="flex flex-col pt-2">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
