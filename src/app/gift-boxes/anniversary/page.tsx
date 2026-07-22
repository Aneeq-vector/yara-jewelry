'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import FixedBoxViewer from '@/components/gift-boxes/FixedBoxViewer';
import { getGiftBoxByType } from '@/lib/data/gift-boxes';
import { getAllCategories } from '@/lib/data/categories';
import { GiftBox, Category } from '@/types';

export default function AnniversaryGiftBoxPage() {
  const [box, setBox] = useState<GiftBox | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGiftBoxByType('anniversary'), getAllCategories()]).then(([data, cats]) => {
      setBox(data || null);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div className="pt-40 pb-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!box) {
    return (
      <PageWrapper>
        <div className="pt-40 pb-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-4">Coming Soon</h1>
          <p className="font-body text-burgundy/60">
            Our Anniversary Gift Box is being prepared. Check back soon!
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <FixedBoxViewer box={box} categories={categories} />
      </motion.div>
    </PageWrapper>
  );
}
