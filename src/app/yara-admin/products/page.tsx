import { validateSession } from '@/lib/pocketbase-server';
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
    const { pb } = await validateSession();
    const [productsRes, categories] = await Promise.all([
      pb.collection('products').getList(1, 10, { 
        sort: '-addedAt,-id', 
        expand: 'category',
        $autoCancel: false,
        fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,description,shortDescription,badge,colors,tags,material,weight,expand.category.id,expand.category.name'
      }),
      pb.collection('categories').getFullList({ sort: 'name', $autoCancel: false }),
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
