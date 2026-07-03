'use client';

import PageWrapper from '@/components/layout/PageWrapper';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SizeGuidePage() {
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
              Size Guide
            </h1>
            <p className="font-body text-[#c9856a] tracking-wide uppercase text-sm font-semibold max-w-2xl mx-auto">
              Find your perfect fit. Use our comprehensive size guide below to determine the right measurements for your Yara jewelry.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-16 font-body text-[#4a1c27]/70 leading-relaxed"
          >
            
            {/* Ring Size */}
            <section className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-[#4a1c27]/5">
              <h2 className="font-heading text-3xl font-bold text-[#4a1c27] mb-6 border-b border-[#4a1c27]/10 pb-4">
                Ring Sizes
              </h2>
              <p className="mb-8">
                The most accurate way to determine your ring size is by measuring the inside diameter of a ring that already fits you well, or by measuring the circumference of your finger.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-[#fdf9f6] text-[#4a1c27] font-semibold">
                      <th className="p-4 border-b border-[#4a1c27]/10 rounded-tl-lg">US Size</th>
                      <th className="p-4 border-b border-[#4a1c27]/10">UK Size</th>
                      <th className="p-4 border-b border-[#4a1c27]/10">Diameter (mm)</th>
                      <th className="p-4 border-b border-[#4a1c27]/10 rounded-tr-lg">Circumference (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#4a1c27]/5 hover:bg-[#fdf9f6]/50 transition-colors">
                      <td className="p-4">5</td>
                      <td className="p-4">J 1/2</td>
                      <td className="p-4">15.7</td>
                      <td className="p-4">49.3</td>
                    </tr>
                    <tr className="border-b border-[#4a1c27]/5 hover:bg-[#fdf9f6]/50 transition-colors">
                      <td className="p-4">6</td>
                      <td className="p-4">L 1/2</td>
                      <td className="p-4">16.5</td>
                      <td className="p-4">51.9</td>
                    </tr>
                    <tr className="border-b border-[#4a1c27]/5 hover:bg-[#fdf9f6]/50 transition-colors">
                      <td className="p-4">7</td>
                      <td className="p-4">N 1/2</td>
                      <td className="p-4">17.3</td>
                      <td className="p-4">54.4</td>
                    </tr>
                    <tr className="border-b border-[#4a1c27]/5 hover:bg-[#fdf9f6]/50 transition-colors">
                      <td className="p-4">8</td>
                      <td className="p-4">P 1/2</td>
                      <td className="p-4">18.1</td>
                      <td className="p-4">57.0</td>
                    </tr>
                    <tr className="hover:bg-[#fdf9f6]/50 transition-colors">
                      <td className="p-4 rounded-bl-lg">9</td>
                      <td className="p-4">R 1/2</td>
                      <td className="p-4">18.9</td>
                      <td className="p-4 rounded-br-lg">59.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Necklace Length */}
            <section className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-[#4a1c27]/5">
              <h2 className="font-heading text-3xl font-bold text-[#4a1c27] mb-6 border-b border-[#4a1c27]/10 pb-4">
                Necklace Lengths
              </h2>
              <p className="mb-6">
                Our necklaces are designed to rest elegantly on the collarbone or chest. Here is a general guide to necklace lengths and where they typically fall.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-[#fdf9f6] rounded-xl">
                  <h3 className="font-heading font-bold text-[#4a1c27] text-xl mb-2">14&quot; - 16&quot; (Choker)</h3>
                  <p className="text-sm">Wraps closely around the base of the neck.</p>
                </div>
                <div className="p-6 bg-[#fdf9f6] rounded-xl">
                  <h3 className="font-heading font-bold text-[#4a1c27] text-xl mb-2">18&quot; (Princess)</h3>
                  <p className="text-sm">Falls beautifully on the collarbone, the most common length.</p>
                </div>
                <div className="p-6 bg-[#fdf9f6] rounded-xl">
                  <h3 className="font-heading font-bold text-[#4a1c27] text-xl mb-2">20&quot; - 24&quot; (Matinee)</h3>
                  <p className="text-sm">Falls between the collarbone and the bust.</p>
                </div>
                <div className="p-6 bg-[#fdf9f6] rounded-xl">
                  <h3 className="font-heading font-bold text-[#4a1c27] text-xl mb-2">30&quot; - 36&quot; (Opera)</h3>
                  <p className="text-sm">Falls below the bust, often worn doubled.</p>
                </div>
              </div>
            </section>

            {/* Bracelet Size */}
            <section className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-[#4a1c27]/5">
              <h2 className="font-heading text-3xl font-bold text-[#4a1c27] mb-6 border-b border-[#4a1c27]/10 pb-4">
                Bracelet Sizes
              </h2>
              <p className="mb-6">
                To find your perfect bracelet size, wrap a flexible measuring tape or a string around your wrist just below the wrist bone.
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Snug Fit:</strong> Add 1/4&quot; to 1/2&quot; (0.5 to 1.5 cm) to your wrist measurement.</li>
                <li><strong>Comfort Fit:</strong> Add 3/4&quot; to 1&quot; (2 to 2.5 cm) to your wrist measurement.</li>
                <li><strong>Loose Fit:</strong> Add 1 1/4&quot; (3 cm) or more to your wrist measurement.</li>
              </ul>
              <p className="mt-6 text-sm italic">
                Note: Many of our bracelets come with an adjustable chain extension of 1&quot; to 2&quot; for a customizable fit.
              </p>
            </section>

            <div className="pt-8 text-center">
              <p>
                Need help finding your size? <Link href="/contact" className="text-[#c9856a] hover:text-[#4a1c27] transition-colors font-medium underline underline-offset-4">Get in touch</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
