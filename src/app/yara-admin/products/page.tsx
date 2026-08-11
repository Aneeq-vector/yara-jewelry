import { getAdminClient } from '@/lib/pocketbase-server';
import { RawProduct, RawCategory } from './_ProductsClient';
import ProductsClient from './_ProductsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  let initialProducts: RawProduct[] = [];
  let initialCategories: RawCategory[] = [];
  let totalItems = 0;
  let totalPages = 0;

  try {
    const pb = await getAdminClient();
    const [productsRes, categories] = await Promise.all([
      pb.collection('products').getList(1, 10, { 
        sort: '-id', 
        expand: 'category',
        fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,expand.category.id,expand.category.name'
      }),
      pb.collection('categories').getFullList({ sort: 'name' }),
    ]);
    initialProducts = JSON.parse(JSON.stringify(productsRes.items));
    totalItems = productsRes.totalItems;
    totalPages = productsRes.totalPages;
    initialCategories = JSON.parse(JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to prefetch products:', err);
  }

  return (
    <ProductsClient
      initialProducts={initialProducts}
      initialTotalItems={totalItems}
      initialTotalPages={totalPages}
      initialCategories={initialCategories}
    />
  );
}
