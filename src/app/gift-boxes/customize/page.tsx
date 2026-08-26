import { getGiftBoxByType } from '@/lib/data/gift-boxes';
import { getAllProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import CustomizeGiftBoxClient from './_CustomizeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customize Your Gift Box | Yara Jewelry',
  description: 'Design your perfect gift box by selecting items from our collection.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomizeGiftBoxPage() {
  const [initialBox, initialProducts, initialCategories] = await Promise.all([
    getGiftBoxByType('custom'),
    getAllProducts(),
    getAllCategories(),
  ]);

  return (
    <CustomizeGiftBoxClient 
      initialBox={initialBox || null}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
