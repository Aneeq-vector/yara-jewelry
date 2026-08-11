import { getAdminClient } from '@/lib/pocketbase-server';
import { RawProduct, RawCategory } from './_ProductsClient';
import ProductsClient from './_ProductsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  let initialProducts: RawProduct[] = [];
  let initialCategories: RawCategory[] = [];

  try {
    const pb = await getAdminClient();
    const [products, categories] = await Promise.all([
      pb.collection('products').getFullList({ sort: '-id', expand: 'category' }),
      pb.collection('categories').getFullList({ sort: 'name' }),
    ]);
    initialProducts = JSON.parse(JSON.stringify(products));
    initialCategories = JSON.parse(JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to prefetch products:', err);
  }

  return (
    <ProductsClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
