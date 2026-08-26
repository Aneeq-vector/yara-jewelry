'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useGiftBoxByType } from '@/lib/hooks/use-gift-boxes';
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
  inStock: true, quantity: 1,
  colors: [],
  tags: ['gift-box', 'custom'],
};

export default function CustomizeGiftBoxClient({ 
  initialBox, 
  initialProducts, 
  initialCategories 
}: { 
  initialBox: GiftBox | null, 
  initialProducts: Product[], 
  initialCategories: Category[] 
}) {
  
  const { data: allProducts = [] } = useProducts(true, initialProducts);
  const { data: categories = [] } = useCategories(initialCategories);
  const { data: box } = useGiftBoxByType('custom', initialBox);

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
    inStock: true, quantity: 1,
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
