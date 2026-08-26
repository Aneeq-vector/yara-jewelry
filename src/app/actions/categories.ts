'use server';

import { validateSession } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(data: { name: string; slug: string; description?: string }) {
  try {
    const { pb } = await validateSession();
    const newCategory = await pb.collection('categories').create(data);
    return { success: true, category: JSON.parse(JSON.stringify(newCategory)) };
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, data: { name?: string; slug?: string; description?: string }) {
  try {
    const { pb } = await validateSession();
    const updatedCategory = await pb.collection('categories').update(id, data);
    return { success: true, category: JSON.parse(JSON.stringify(updatedCategory)) };
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return { success: false, error: error.message || 'Failed to update category' };
  }
}

export async function updateCategoryWithProductsAction(
  id: string, 
  data: { name?: string; slug?: string; description?: string },
  addProducts: string[],
  removeProducts: string[]
) {
  try {
    const { pb } = await validateSession();
    if (typeof pb.createBatch !== 'function') {
      throw new Error('PocketBase Batch API is required for this operation but not available in the current SDK version.');
    }

    const uniqueAddIds = [...new Set(addProducts)];
    const uniqueRemoveIds = [...new Set(removeProducts)];

    const allInvolvedIds = [...new Set([...uniqueAddIds, ...uniqueRemoveIds])];
    
    let existingProducts: any[] = [];
    if (allInvolvedIds.length > 0) {
      const filter = allInvolvedIds.map(pid => `id="${pid}"`).join(' || ');
      existingProducts = await pb.collection('products').getFullList({
        filter: filter,
        fields: 'id,category',
      });
    }

    const batch = pb.createBatch();

    // 1. Update Category
    batch.collection('categories').update(id, data);

    // 2. Validate and stage Removals
    for (const removeId of uniqueRemoveIds) {
      const prod = existingProducts.find(p => p.id === removeId);
      if (!prod) continue; // Product might have been deleted, ignore
      if (prod.category !== id) {
        return { 
          success: false, 
          error: "One or more products changed while you were editing this category. Refresh the category and try again.", 
          validationError: true 
        };
      }
      batch.collection('products').update(removeId, { category: "" });
    }

    // 3. Validate and stage Additions/Moves
    for (const addId of uniqueAddIds) {
      const prod = existingProducts.find(p => p.id === addId);
      if (!prod) continue;
      // Skip if already target category (idempotent)
      if (prod.category === id) continue;
      
      batch.collection('products').update(addId, { category: id });
    }

    await batch.send();
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update category with products:', error);
    return { success: false, error: error.message || 'Failed to save changes.' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const { pb } = await validateSession();
    
    // Safety check: Check if products are using this category
    const productsRes = await pb.collection('products').getList(1, 1, {
      filter: `category = "${id}"`,
      $autoCancel: false,
    });
    
    if (productsRes.totalItems > 0) {
      return { 
        success: false, 
        error: `This category is currently used by ${productsRes.totalItems} product(s). Reassign those products before deleting this category.` 
      };
    }
    
    await pb.collection('categories').delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}

export async function assignProductsToCategoryAction(productIds: string[], categoryId: string) {
  try {
    const { pb } = await validateSession();
    // Use PocketBase Batch for atomic operations
    if (typeof pb.createBatch !== 'function') {
      throw new Error('PocketBase Batch API is required for this operation but not available in the current SDK version.');
    }

    const uniqueProductIds = [...new Set(productIds)];
    if (uniqueProductIds.length === 0) return { success: true };

    const filter = uniqueProductIds.map(id => `id="${id}"`).join(' || ');
    const existingProducts = await pb.collection('products').getFullList({
      filter: filter,
      fields: 'id,category',
    });

    const alreadyAssignedCount = existingProducts.filter(p => p.category === categoryId).length;
    if (alreadyAssignedCount > 0) {
      const msg = alreadyAssignedCount === 1 
        ? "This product is already in the target category."
        : `${alreadyAssignedCount} selected products are already in the target category.`;
      return { success: false, error: msg, validationError: true };
    }

    const batch = pb.createBatch();
    
    for (const prod of existingProducts) {
      batch.collection('products').update(prod.id, { category: categoryId });
    }
    
    await batch.send();
    
    // We only invalidate the affected specific caches in TanStack, no revalidateAll needed here.
    return { success: true };
  } catch (error: any) {
    console.error('Failed to assign products:', error);
    return { success: false, error: error.message || 'Failed to assign products to category' };
  }
}

export async function removeProductFromCategoryAction(productId: string) {
  try {
    const { pb } = await validateSession();
    await pb.collection('products').update(productId, { category: "" });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to remove product from category:', error);
    return { success: false, error: error.message || 'Failed to remove product from category' };
  }
}
