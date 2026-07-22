'use server';

import { getServerClient } from '@/lib/pocketbase-server';
import { Product } from '@/types';
import { mapRecordToProduct } from '@/lib/data/products';

export async function getUserWishlistAction(): Promise<{ success: boolean; items?: Product[]; error?: string }> {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || !pb.authStore.record) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = pb.authStore.record.id;
    const res = await pb.collection('wishlist').getFullList({
      filter: `user="${userId}"`,
      expand: 'product'
    });

    // Map to Product array
    const items = res.map((record) => {
      const product = record.expand?.product;
      if (!product) return null;
      return mapRecordToProduct(product as any);
    }).filter((p): p is Product => p !== null);

    return { success: true, items };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch wishlist' };
  }
}

export async function addToWishlistAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || !pb.authStore.record) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = pb.authStore.record.id;

    // Check if already exists
    const exists = await pb.collection('wishlist').getList(1, 1, {
      filter: `user="${userId}" && product="${productId}"`
    });

    if (exists.totalItems === 0) {
      await pb.collection('wishlist').create({
        user: userId,
        product: productId
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add to wishlist' };
  }
}

export async function removeFromWishlistAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || !pb.authStore.record) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = pb.authStore.record.id;

    // Find the record
    const records = await pb.collection('wishlist').getList(1, 1, {
      filter: `user="${userId}" && product="${productId}"`
    });

    if (records.items.length > 0) {
      await pb.collection('wishlist').delete(records.items[0].id);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove from wishlist' };
  }
}

export async function syncWishlistAction(localProductIds: string[]): Promise<{ success: boolean; items?: Product[]; error?: string }> {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || !pb.authStore.record) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = pb.authStore.record.id;

    // Get current remote wishlist
    const remoteRecords = await pb.collection('wishlist').getFullList({
      filter: `user="${userId}"`,
      expand: 'product'
    });

    const remoteProductIds = remoteRecords.map(r => r.product);
    
    // Add missing local products to remote
    for (const pid of localProductIds) {
      if (!remoteProductIds.includes(pid)) {
        await pb.collection('wishlist').create({
          user: userId,
          product: pid
        });
      }
    }

    // Refetch the complete list
    const finalRecords = await pb.collection('wishlist').getFullList({
      filter: `user="${userId}"`,
      expand: 'product'
    });

    const items = finalRecords.map((record) => {
      const product = record.expand?.product;
      if (!product) return null;
      return mapRecordToProduct(product as any);
    }).filter((p): p is Product => p !== null);

    return { success: true, items };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sync wishlist' };
  }
}
