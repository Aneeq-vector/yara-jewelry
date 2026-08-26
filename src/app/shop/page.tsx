import { getAllProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import ShopPageClient from './_ShopClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products | Yara Jewelry',
  description: 'Browse our entire collection of elegant jewelry. Find the perfect necklaces, earrings, bracelets, and rings.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  const [initialProducts, initialCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  return <ShopPageClient initialProducts={initialProducts} initialCategories={initialCategories} />;
}
