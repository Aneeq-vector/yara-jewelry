'use server';

import { validateSession } from '@/lib/pocketbase-server';

export async function updateGiftBoxAction(id: string, formData: FormData) {
  try {
    const { pb } = await validateSession();
    const record = await pb.collection('gift_boxes').update(id, formData, { expand: 'fixed_items' });
    return { success: true, giftBox: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update gift box', details: error.data };
  }
}
