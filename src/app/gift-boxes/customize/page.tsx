'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import CustomBoxBuilder from '@/components/shop/CustomBoxBuilder';
import { getGiftBoxByType } from '@/lib/data/gift-boxes';
import { getAllProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
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
  const [box, setBox] = useState<GiftBox | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGiftBoxByType('custom'), getAllProducts(), getAllCategories()]).then(
      ([giftBox, products, cats]) => {
        setBox(giftBox || null);
        setAllProducts(products);
        setCategories(cats);
        setLoading(false);
      }
    );
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
