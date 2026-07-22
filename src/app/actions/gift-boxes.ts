'use server';

import { getAdminClient } from '@/lib/pocketbase-server';

export async function updateGiftBoxAction(id: string, formData: FormData) {
  try {
    const pb = await getAdminClient();
    const record = await pb.collection('gift_boxes').update(id, formData, { expand: 'fixed_items' });
    return { success: true, giftBox: JSON.parse(JSON.stringify(record)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update gift box', details: error.data };
  }
}
