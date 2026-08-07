import os

products_path = 'src/app/actions/products.ts'
with open(products_path, 'r') as f:
    products_content = f.read()

products_content += """
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

with open(products_path, 'w') as f:
    f.write(products_content)

page_path = 'src/app/yara-admin/gift-boxes/page.tsx'
with open(page_path, 'r') as f:
    page_content = f.read()

page_content = page_content.replace("from '@/app/actions/gift-boxes';", "from '@/app/actions/products';")

with open(page_path, 'w') as f:
    f.write(page_content)

os.remove('src/app/actions/gift-boxes.ts')

constants_path = 'src/lib/constants.ts'
with open(constants_path, 'r') as f:
    c_content = f.read()
c_content = c_content.replace('export const NAV_LINKS', 'const NAV_LINKS')
with open(constants_path, 'w') as f:
    f.write(c_content)

