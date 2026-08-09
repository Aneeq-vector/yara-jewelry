'use client';

import { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=2400&q=85',
    tag: 'The Summer Collection 2026',
    title: 'Unveil Your Aura.',
    subtitle: 'Imitation jewelry redefined. Express your individuality with pieces that mirror high-end fashion, without the premium price tag.',
    align: 'left',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=2400&q=85',
    tag: 'Bestselling Icons',
    title: 'Timeless Elegance.',
    subtitle: 'Discover our most loved pieces, meticulously crafted to elevate your everyday style seamlessly.',
    align: 'center',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=2400&q=85',
    tag: 'Limited Edition',
    title: 'Bold & Brilliant.',
    subtitle: 'Statement rings and breathtaking accessories designed exclusively for the modern trendsetter.',
    align: 'right',
  }
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setActive((prev) => (prev + 1) % BANNERS.length);
  const prev = () => setActive((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <section className="relative w-full min-h-screen bg-ivory pt-24 pb-8 flex flex-col items-center justify-center">
      
      {/* Island Banner Container */}
      <div 
        className="relative w-[96%] max-w-[1800px] min-h-[550px] h-[85vh] md:h-[82vh] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-burgundy/15"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={BANNERS[active].image}
              alt={BANNERS[active].title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy/90 via-burgundy/20 to-transparent" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex items-center z-10 max-w-7xl mx-auto px-4 sm:px-12 lg:px-16">
              <div 
                className={`w-full max-w-2xl mt-12 sm:mt-0 ${
                  BANNERS[active].align === 'center' ? 'mx-auto text-center' :
                  BANNERS[active].align === 'right' ? 'ml-auto text-right' : 'text-left'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 sm:mb-6 shadow-lg ${
                    BANNERS[active].align === 'center' ? 'mx-auto' :
                    BANNERS[active].align === 'right' ? 'ml-auto' : ''
                  }`}
                >
                  <Sparkles size={14} className="text-champagne" />
                  <span className="font-ui text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white">
                    {BANNERS[active].tag}
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="font-heading text-[2.75rem] leading-[1] sm:text-6xl lg:text-[6rem] font-bold sm:leading-[0.95] text-white mb-4 sm:mb-6 drop-shadow-md"
                >
                  {BANNERS[active].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={`font-body text-base sm:text-xl text-white/90 leading-relaxed mb-8 sm:mb-10 max-w-lg drop-shadow-sm ${
                    BANNERS[active].align === 'center' ? 'mx-auto' :
                    BANNERS[active].align === 'right' ? 'ml-auto' : ''
                  }`}
                >
                  {BANNERS[active].subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`flex items-center gap-4 ${
                    BANNERS[active].align === 'center' ? 'justify-center' :
                    BANNERS[active].align === 'right' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <Link href="/shop" className="group relative isolate flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/95 text-burgundy shadow-xl hover:shadow-2xl transition duration-500 hover:scale-105 overflow-hidden">
                    {/* Animated gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F6EBDD] via-[#E8C4B0] to-[#F6EBDD] bg-[length:200%_auto] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500 -z-10" />
                    
                    <span className="font-ui font-bold text-xs sm:text-sm tracking-[0.1em] uppercase relative z-10">Shop Collection</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-burgundy/10 flex items-center justify-center group-hover:bg-burgundy group-hover:text-white transition duration-300 relative z-10">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between">
          
          {/* Progress / Pagination */}
          <div className="flex items-center gap-3">
            <span className="font-heading text-white font-medium text-sm w-4">0{active + 1}</span>
            <div className="flex items-center gap-1.5">
              {BANNERS.map((banner, i) => (
                <button
                  key={banner.id}
                  onClick={() => setActive(i)}
                  className={`relative h-1.5 rounded-full transition duration-500 ${
                    active === i ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                  } after:content-[''] after:absolute after:-inset-y-5 after:-inset-x-2`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <span className="font-heading text-white/50 font-medium text-xs w-4">0{BANNERS.length}</span>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button aria-label="Action" 
              onClick={prev}
              className="w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-burgundy transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button aria-label="Action" 
              onClick={next}
              className="w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-burgundy transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
