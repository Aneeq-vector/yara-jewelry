'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Droplet, Sun, Wind, Sparkles } from 'lucide-react';

export default function CareInstructionsPage() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-24 bg-[#fdf9f6] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#4a1c27] mb-4">
              Care Instructions
            </h1>
            <p className="font-body text-[#c9856a] tracking-wide uppercase text-sm font-semibold max-w-2xl mx-auto">
              Keep your Yara pieces shining for years to come
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-16 font-body text-[#4a1c27]/70 leading-relaxed"
          >
            
            <section className="text-center max-w-2xl mx-auto">
              <p className="text-lg">
                Yara jewelry is crafted with premium materials designed for longevity. To ensure your pieces maintain their original brilliance, we recommend following these simple care practices.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Care */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#4a1c27]/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#fdf9f6] rounded-full flex items-center justify-center text-[#c9856a] mb-6">
                  <Sparkles size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">Daily Wear</h3>
                <p>
                  Put your jewelry on last, after applying makeup, perfume, and hairspray. Take it off first when undressing. This minimizes exposure to chemicals that can cause dullness.
                </p>
              </section>

              {/* Water Exposure */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#4a1c27]/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#fdf9f6] rounded-full flex items-center justify-center text-[#c9856a] mb-6">
                  <Droplet size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">Keep It Dry</h3>
                <p>
                  Remove your jewelry before swimming, showering, exercising, or doing household chores. Chlorine, salt water, and sweat can tarnish and damage the finish.
                </p>
              </section>

              {/* Storage */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#4a1c27]/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#fdf9f6] rounded-full flex items-center justify-center text-[#c9856a] mb-6">
                  <Sun size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">Proper Storage</h3>
                <p>
                  Store your pieces in a cool, dry place, out of direct sunlight. Keep them separate in the provided Yara pouch or a lined jewelry box to prevent scratching and tangling.
                </p>
              </section>

              {/* Cleaning */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#4a1c27]/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#fdf9f6] rounded-full flex items-center justify-center text-[#c9856a] mb-6">
                  <Wind size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#4a1c27] mb-4">Gentle Cleaning</h3>
                <p>
                  Wipe your jewelry gently with a soft, lint-free cloth after each wear to remove oils and dirt. Avoid using harsh chemical cleaners, ultrasonic cleaners, or abrasive materials.
                </p>
              </section>
            </div>

            <section className="bg-gradient-to-r from-[#4a1c27] to-[#5d1217] text-[#fdf9f6] p-8 sm:p-12 rounded-2xl text-center shadow-md">
              <h2 className="font-heading text-3xl font-bold mb-4">Our Guarantee</h2>
              <p className="max-w-2xl mx-auto opacity-90">
                While our jewelry is robust, it is still delicate. If you ever experience issues with the craftsmanship of your Yara pieces, please let us know.
              </p>
              <div className="mt-8">
                <Link 
                  href="/contact" 
                  className="inline-block bg-[#c9856a] hover:bg-[#b57358] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm"
                >
                  Contact Support
                </Link>
              </div>
            </section>

          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
