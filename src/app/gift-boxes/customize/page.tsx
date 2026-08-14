'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { getGiftBoxByType } from '@/lib/data/gift-boxes';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { usePublicProductRealtime } from '@/lib/hooks/use-product-realtime';
import { GiftBox, Product, Category } from '@/types';

const fallbackBox: Product = {
  id: 'customize-gift-box-fallback',
  name: 'Customize Gift Box',
  price: 400,
  description:
    "Design your perfect gift box! Choose any jewelry pieces from our collection and we'll package them beautifully. Need more customization? Chat with us on WhatsApp!",
  shortDescription: 'Build your own gift set',
  category: 'gift-boxes' as any,
  images: ['/placeholder.png'],
  rating: 5,
  reviewCount: 0,
  material: 'Premium Gift Packaging',
  weight: '',
  inStock: true,
  colors: [],
  tags: ['gift-box', 'custom'],
};

export default function CustomizeGiftBoxPage() {
  usePublicProductRealtime();
  
  const [box, setBox] = useState<GiftBox | null>(null);
  const [boxLoading, setBoxLoading] = useState(true);

  const { data: allProducts = [], isPending: productsLoading } = useProducts();
  const { data: categories = [], isPending: categoriesLoading } = useCategories();

  const loading = boxLoading || productsLoading || categoriesLoading;

  useEffect(() => {
    getGiftBoxByType('custom').then(giftBox => {
      setBox(giftBox || null);
      setBoxLoading(false);
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
        <CustomBoxBuilder baseBox={fallbackBox} allProducts={allProducts} categories={categories} />
      </PageWrapper>
    );
  }

  const boxAsProduct: Product = {
    id: box.id,
    name: box.name,
    price: box.boxPrice,
    description: box.description,
    shortDescription: box.shortDescription,
    category: 'gift-boxes' as any,
    images: box.images,
    rating: 5,
    reviewCount: 0,
    material: 'Premium Gift Packaging',
    weight: '',
    inStock: true,
    colors: [],
    tags: ['gift-box', 'custom'],
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CustomBoxBuilder baseBox={boxAsProduct} allProducts={allProducts} categories={categories} />
      </motion.div>
    </PageWrapper>
  );
}
