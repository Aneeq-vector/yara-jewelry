'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, Gift, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function NotAvailableBox({ name }: { name: string }) {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mx-auto w-20 h-20 rounded-full bg-champagne/60 border border-nude/60 flex items-center justify-center"
        >
          <Lock size={32} className="text-burgundy/40" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-burgundy mb-4"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-body text-lg text-burgundy/50 mb-8"
        >
          We're currently not offering this gift box. Please check back soon or
          browse our other options.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/gift-boxes"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Gift size={16} />
            View All Gift Boxes
          </Link>
          <a
            href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
              `Hi! I was looking for the "${name}" — is it available?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-green-500/40 bg-green-50 text-green-700 font-ui font-semibold text-sm hover:bg-green-100 transition-colors"
          >
            <MessageCircle size={16} />
            Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}
