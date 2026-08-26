import { validateSession } from '@/lib/pocketbase-server';
import CategoriesClient from './_CategoriesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoriesPage() {
  let initialCategories: any[] = [];
  
  try {
    const { pb } = await validateSession();
    // Categories are typically not paginated or just a small full list
    const res = await pb.collection('categories').getFullList({
      sort: 'name',
      $autoCancel: false,
    });
    initialCategories = JSON.parse(JSON.stringify(res));
  } catch (err) {
    console.error('Failed to prefetch categories:', err);
  }

  return (
    <CategoriesClient initialCategories={initialCategories} />
  );
}
