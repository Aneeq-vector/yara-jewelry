'use server';

import { validateSession, getAdminClient } from '@/lib/pocketbase-server';

export async function deleteGiftBoxAction(id: string) {
  try {
    await validateSession();
    const adminPb = await getAdminClient();
    
    // Safety check: Check if historical orders are using this gift box
    // PocketBase allows searching JSON fields with the ~ (like) operator.
    // The giftBoxId is stored inside the cartDetails JSON string, NOT in the items array.
    const ordersRes = await adminPb.collection('orders').getList(1, 1, {
      filter: `cartDetails ~ "\\"productId\\":\\"${id}\\""`,
      $autoCancel: false,
    });
    
    if (ordersRes.totalItems > 0) {
      return { 
        success: false, 
        error: `This gift box is referenced by existing orders and cannot be deleted. You can mark it inactive instead.` 
      };
    }
    
    await adminPb.collection('gift_boxes').delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete gift box:', error);
    return { success: false, error: error.message || 'Failed to delete gift box' };
  }
}
