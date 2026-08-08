'use server';

import { getAdminClient, getServerClient, validateSession } from '@/lib/pocketbase-server';
import { productSchema } from '@/lib/schemas';


export async function deleteProductAction(id: string) {
  try {
    await validateSession();
    const pb = await getAdminClient();
    await pb.collection('products').delete(id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete product' };
  }
}

export async function deleteProductsAction(ids: string[]) {
  try {
    await validateSession();
    const pb = await getAdminClient();
    await Promise.all(ids.map(id => pb.collection('products').delete(id).catch(e => console.error(`Failed to delete ${id}`, e))));
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete products' };
  }
}

export async function updateProductDetailsAction(id: string, payload: any) {
  try {
    await validateSession();
    const pb = await getAdminClient();
    // getAdminClient automatically authenticates as admin, so we don't need to check authStore validity
    const record = await pb.collection('products').update(id, payload);
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product' };
  }
}

export async function updateProductWithFilesAction(id: string, formData: FormData) {
  try {
    await validateSession();
    const pb = await getAdminClient();
    
    // Convert FormData to standard PocketBase payload
    // PocketBase's SDK natively handles FormData instances for file uploads!
    const record = await pb.collection('products').update(id, formData);
    
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product', details: error.data };
  }
}

export async function createProductWithFilesAction(formData: FormData) {
  try {
    await validateSession();
    const pb = await getAdminClient();
    const record = await pb.collection('products').create(formData);
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to create product', details: error.data };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    await validateSession();
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
    return { success: true, product: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to duplicate product', details: error.data };
  }
}

