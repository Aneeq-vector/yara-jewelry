import { createClient } from '@/lib/pocketbase';
import { getAllCategories } from '@/lib/data/categories';
import { getProductOptionsAction } from '@/app/actions/products';
import GiftBoxesAdminClient from './_GiftBoxesAdminClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gift Boxes Admin | Yara',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GiftBoxesAdminPage() {
  const pb = createClient();
  
  // Parallel fetch for boxes, categories, and products
  const [rawBoxes, categories, productsRes] = await Promise.all([
    pb.collection('gift_boxes').getFullList({ expand: 'fixed_items', $autoCancel: false }),
    getAllCategories(),
    getProductOptionsAction(),
  ]);

  const mappedBoxes = rawBoxes.map((r: any) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    slug: r.slug,
    description: r.description,
    box_price: r.box_price,
    images: (r.images || []).map((fn: string) => 
      `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${r.collectionId}/${r.id}/${encodeURIComponent(fn)}`
    ),
    imageFiles: r.images || [],
    fixed_items: r.fixed_items || [],
    category: Array.isArray(r.category) ? r.category[0] || '' : r.category || '',
    is_active: r.is_active ?? true,
    collectionId: r.collectionId,
  }));

  const products = productsRes.success && productsRes.products ? productsRes.products : [];

  return (
    <GiftBoxesAdminClient 
      initialBoxes={mappedBoxes} 
      initialCategories={categories} 
      initialAllProducts={products as any[]} 
    />
  );
}
