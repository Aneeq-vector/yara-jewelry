import os

new_action = """'use server';

import { getAdminClient } from '@/lib/pocketbase-server';

export async function updateGiftBoxAction(id: string, formData: FormData) {
  try {
    const pb = await getAdminClient();
    const record = await pb.collection('gift_boxes').update(id, formData, { expand: 'fixed_items' });
    return { success: true, giftBox: structuredClone(record) };
  } catch (error: any) {
    return { error: error.message || 'Failed to update gift box', details: error.data };
  }
}
"""

with open('src/app/actions/update-gift-box.ts', 'w') as f:
    f.write(new_action)

# Remove it from products.ts
with open('src/app/actions/products.ts', 'r') as f:
    c = f.read()

start = c.find('export async function updateGiftBoxAction')
if start != -1:
    end = c.find('}\n', start) + 2
    c = c[:start] + c[end:]

with open('src/app/actions/products.ts', 'w') as f:
    f.write(c)

page = 'src/app/yara-admin/gift-boxes/page.tsx'
with open(page, 'r') as f:
    c = f.read()
c = c.replace("from '@/app/actions/products';", "from '@/app/actions/update-gift-box';")
with open(page, 'w') as f:
    f.write(c)

