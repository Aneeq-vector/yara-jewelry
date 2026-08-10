'use server';

import { getAdminClient } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

// Safe serializer: converts PocketBase RecordModel → plain JSON
function toPlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Revalidate public-facing pages that display products.
// Admin pages prefetch server-side so they don't need cache invalidation.
function revalidateAll() {
  revalidatePath('/shop', 'page');
  revalidatePath('/shop/[id]', 'page');
  revalidatePath('/', 'page'); // home page (trending products etc)
}

export async function getProductsAction() {
  try {
    const pb = await getAdminClient();
    const records = await pb.collection('products').getFullList({
      sort: '-created',
      expand: 'category',
    });
    return { success: true, products: toPlain(records) };
  } catch (error: any) {
    console.error('getProductsAction error:', error.message);
    return { success: false, error: error.message || 'Failed to fetch products' };
  }
}

export async function getCategoriesAction() {
  try {
    const pb = await getAdminClient();
    const records = await pb.collection('categories').getFullList({ sort: 'name' });
    return { success: true, categories: toPlain(records) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch categories' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    await pb.collection('products').delete(id);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

export async function deleteProductsAction(ids: string[]) {
  try {
    const pb = await getAdminClient();
    await Promise.all(
      ids.map(id => pb.collection('products').delete(id).catch(e => console.error(`Delete ${id} failed:`, e)))
    );
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete products' };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    const original = await pb.collection('products').getOne(id);
    const newData: any = { ...toPlain(original) };
    delete newData.id;
    delete newData.created;
    delete newData.updated;
    delete newData.images;
    delete newData.collectionId;
    delete newData.collectionName;
    newData.name = `${newData.name} (Copy)`;
    const record = await pb.collection('products').create(newData);
    revalidateAll();
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to duplicate product' };
  }
}

// Returns admin token so the browser can upload files DIRECTLY to PocketBase
// (bypasses Next.js/Vercel body size limits and serialization overhead)
export async function getAdminTokenAction(): Promise<{ token?: string; pbUrl?: string; error?: string }> {
  try {
    const pb = await getAdminClient();
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop';
    return { token: pb.authStore.token, pbUrl };
  } catch (error: any) {
    return { error: error.message || 'Failed to get admin token' };
  }
}

export async function revalidateProductsAction() {
  revalidateAll();
}
