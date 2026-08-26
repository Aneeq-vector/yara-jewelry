'use client';

import { useState, useEffect, use } from 'react';
import { m as motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import FixedBoxViewer from '@/components/gift-boxes/FixedBoxViewer';
import { useGiftBoxById } from '@/lib/hooks/use-gift-boxes';
import { useCategories } from '@/lib/hooks/use-categories';
import { GiftBox, Category } from '@/types';

export default function GiftBoxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: box, isPending: boxLoading } = useGiftBoxById(resolvedParams.id);
  const { data: categories = [], isPending: categoriesLoading } = useCategories();

  const loading = boxLoading || categoriesLoading;

  if (loading) {
    return (
      <PageWrapper>
        <div className="pt-40 pb-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!box || !box.isActive) {
    return (
      <PageWrapper>
        <div className="pt-40 pb-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-4">Coming Soon</h1>
          <p className="font-body text-burgundy/60">
            This Gift Box is being prepared. Check back soon!
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
