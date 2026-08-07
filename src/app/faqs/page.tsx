'use client';

import { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Link from 'next/link';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: "Orders & Shipping",
    items: [
      {
        question: "How long does shipping take?",
        answer: "Orders are typically processed within 1-2 business days. Standard shipping within the country usually takes 3-5 business days. International shipping times vary by destination."
      },
      {
        question: "Do you offer international shipping?",
        answer: "Currently, we ship within the country. We are working on expanding our delivery network to include international destinations soon."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive a tracking number via email. You can use this number on our carrier's website to track the status of your delivery."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-Day Hassle-Free Exchange. We do not offer refunds, but we are happy to assist with an exchange if the item is returned in its original, unworn condition within 7 days of delivery."
      },
      {
        question: "What if I receive a damaged item?",
        answer: "If you receive a damaged or incorrect item, please email us at hello@yarajewelry.com within 7 days of receiving your order, and we will resolve the issue at no extra cost to you."
      }
    ]
  },
  {
    category: "Product & Care",
    items: [
      {
        question: "Are your products tarnish-resistant?",
        answer: "Our jewelry is crafted from premium materials. While they are designed to be durable and tarnish-resistant under normal wear, we recommend following our care instructions to maintain their brilliance over time."
      },
      {
        question: "How should I clean my jewelry?",
        answer: "Gently wipe your jewelry with a soft, dry cloth after each use. Avoid harsh chemicals, perfumes, and prolonged exposure to water to keep your pieces looking their best."
      }
    ]
  }
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageWrapper>
      <div className="pt-32 pb-24 bg-[#fdf9f6] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 sm:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#4a1c27] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-body text-[#c9856a] tracking-wide uppercase text-sm font-semibold">
              How can we help you?
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-12"
          >
            {FAQ_ITEMS.map((section, sIndex) => (
              <div key={section.category}>
                <h2 className="font-heading text-2xl font-bold text-[#4a1c27] mb-6 border-b border-[#4a1c27]/10 pb-4">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, iIndex) => {
                    const idx = `${sIndex}-${iIndex}`;
                    const isOpen = openIndex === idx;
                    return (
                      <div 
                        key={idx}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#4a1c27]/5"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                        >
                          <span className="font-heading text-lg font-semibold text-[#4a1c27]">
                            {item.question}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[#c9856a] flex-shrink-0 ml-4"
                          >
                            <ChevronDown size={20} />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="px-6 pb-5 pt-1 font-body text-[#4a1c27]/70 leading-relaxed">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 pt-8 border-t border-[#4a1c27]/10 text-center"
          >
            <p className="font-body text-[#4a1c27]/70">
              Still have questions?{' '}
              <Link href="/contact" className="text-[#c9856a] hover:text-[#4a1c27] transition-colors font-medium underline underline-offset-4">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
