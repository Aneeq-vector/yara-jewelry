'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '@/lib/data/testimonials';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const prev = () => {
    setAutoplay(false);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setAutoplay(false);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-champagne/20 to-ivory" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-gold/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold mb-3 block">
            Testimonials
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-burgundy mb-4">
            Loved By Thousands
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative">
                  {/* Quote icon */}
                  <div className="absolute top-6 left-8 opacity-10">
                    <Quote size={48} className="text-burgundy" />
                  </div>

                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < testimonials[current].rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-nude'
                        }
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="font-editorial text-lg sm:text-xl lg:text-2xl text-burgundy/80 leading-relaxed mb-8 italic">
                    &ldquo;{testimonials[current].comment}&rdquo;
                  </p>

                  {/* Customer */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-gold-light/50">
                      <Image
                        src={testimonials[current].image}
                        alt={testimonials[current].name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-ui font-semibold text-sm text-burgundy">
                        {testimonials[current].name}
                      </h4>
                      <p className="font-body text-xs text-burgundy/45">
                        {testimonials[current].location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={prev}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-burgundy/60 hover:text-burgundy transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrent(i);
                      setAutoplay(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-8 gradient-rose-gold'
                        : 'w-2 bg-nude hover:bg-rose-gold-light'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-burgundy/60 hover:text-burgundy transition-colors"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
