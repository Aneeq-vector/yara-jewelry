'use server';

import { getAdminClient, getServerClient, validateSession } from '@/lib/pocketbase-server';
import { productSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';


export async function deleteProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    await pb.collection('products').delete(id);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete product' };
  }
}

export async function deleteProductsAction(ids: string[]) {
  try {
    const pb = await getAdminClient();
    await Promise.all(ids.map(id => pb.collection('products').delete(id).catch(e => console.error(`Failed to delete ${id}`, e))));
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete products' };
  }
}

export async function updateProductDetailsAction(id: string, payloadStr: string) {
  try {
    const payload = JSON.parse(payloadStr);
    const pb = await getAdminClient();
    const record = await pb.collection('products').update(id, payload);
    revalidatePath('/', 'layout');
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    console.error('Update Product Details Error:', error.message, error.data);
    return { error: error.message || 'Failed to update product', details: error.data };
  }
}

export async function updateProductWithFilesAction(id: string, formData: FormData) {
  try {
    const pb = await getAdminClient();
    
    // Convert FormData to standard PocketBase payload
    // PocketBase's SDK natively handles FormData instances for file uploads!
    const record = await pb.collection('products').update(id, formData);
    revalidatePath('/', 'layout');
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product', details: error.data };
  }
}

export async function createProductWithFilesAction(formData: FormData) {
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      return { error: `Missing env vars: EMAIL=${!!adminEmail} PASS=${!!adminPassword}`, details: {} };
    }
    const pb = await getAdminClient();
    const record = await pb.collection('products').create(formData);
    revalidatePath('/', 'layout');
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    const details = error?.data || error?.response?.data || {};
    const msg = `[${error?.status || 'no-status'}] ${error?.message || 'unknown'}`;
    console.error('CREATE PRODUCT ERROR:', msg, JSON.stringify(details));
    return { error: msg, details };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    const original = await pb.collection('products').getOne(id);
    
    // Duplicate data
    const newData: any = { ...original };
    delete newData.id;
    delete newData.created;
    delete newData.updated;
    delete newData.images; // File duplication requires re-uploading
    newData.name = `${newData.name} (Copy)`;
    
    const record = await pb.collection('products').create(newData);
    revalidatePath('/', 'layout');
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to duplicate product', details: error.data };
  }
}

// Returns only the admin token so the browser can upload directly to PocketBase
// This avoids sending large file payloads through Vercel's server action body size limit
export async function getAdminTokenAction(): Promise<{ token?: string; error?: string }> {
  try {
    const pb = await getAdminClient();
    return { token: pb.authStore.token };
  } catch (error: any) {
    return { error: error.message || 'Failed to get admin token' };
  }
}

export async function revalidateProductsAction() {
  revalidatePath('/', 'layout');
}
