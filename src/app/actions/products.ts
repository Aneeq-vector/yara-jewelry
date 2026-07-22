'use server';

import { getAdminClient, getServerClient } from '@/lib/pocketbase-server';
import { productSchema } from '@/lib/schemas';

export async function createProductAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  // For numbers, we need to cast them before validation
  const payload = {
    ...data,
    price: Number(data.price),
    stock: Number(data.stock),
    is_active: data.is_active === 'on' || data.is_active === 'true',
  };

  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten().fieldErrors };
  }

  try {
    const pb = await getAdminClient();
    const record = await pb.collection('products').create(parsed.data);
    return { success: true, product: record };
  } catch (error: any) {
    return { error: error.message || 'Failed to create product' };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const payload = {
    ...data,
    price: Number(data.price),
    stock: Number(data.stock),
    is_active: data.is_active === 'on' || data.is_active === 'true',
  };

  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten().fieldErrors };
  }

  try {
    const pb = await getAdminClient();
    const record = await pb.collection('products').update(id, parsed.data);
    return { success: true, product: record };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    await pb.collection('products').delete(id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete product' };
  }
}

export async function updateProductDetailsAction(id: string, payload: any) {
  try {
    const pb = await getAdminClient();
    // getAdminClient automatically authenticates as admin, so we don't need to check authStore validity
    const record = await pb.collection('products').update(id, payload);
    return { success: true, product: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product' };
  }
}

export async function updateProductWithFilesAction(id: string, formData: FormData) {
  try {
    const pb = await getAdminClient();
    
    // Convert FormData to standard PocketBase payload
    // PocketBase's SDK natively handles FormData instances for file uploads!
    const record = await pb.collection('products').update(id, formData);
    
    return { success: true, product: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update product', details: error.data };
  }
}

export async function createProductWithFilesAction(formData: FormData) {
  try {
    const pb = await getAdminClient();
    const record = await pb.collection('products').create(formData);
    return { success: true, product: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to create product', details: error.data };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    const pb = await getAdminClient();
    const original = await pb.collection('products').getOne(id);
    
    // Duplicate data
    const newData = { ...original };
    delete newData.id;
    delete newData.created;
    delete newData.updated;
    delete newData.images; // File duplication requires re-uploading
    newData.name = `${newData.name} (Copy)`;
    
    const record = await pb.collection('products').create(newData);
    return { success: true, product: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to duplicate product', details: error.data };
  }
}
