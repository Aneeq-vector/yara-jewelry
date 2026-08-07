import { GiftBox, Product } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

// Helper to map PocketBase product record to Product type
function mapProductRecord(record: RecordModel): Product {
  const images = (record.images || []).map(
    (filename: string) =>
      filename.startsWith('http')
        ? filename
        : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`
  );
  return {
    id: record.id,
    name: record.name,
    price: record.price,
    originalPrice: record.originalPrice,
    description: record.description,
    shortDescription: record.shortDescription,
    category: record.category as any,
    images: images.length > 0 ? images : ['/placeholder.png'],
    badge: record.badge || undefined,
    rating: record.rating || 0,
    reviewCount: record.reviewCount || 0,
    material: record.material || '',
    weight: record.weight || '',
    inStock: record.inStock ?? true,
    colors: record.colors || [],
    tags: record.tags || [],
  };
}

function mapRecordToGiftBox(record: RecordModel): GiftBox {
  // Build image URLs from PocketBase file fields
  const images = Array.isArray(record.images)
    ? record.images.map((filename: string) =>
        filename.startsWith('http')
          ? filename
          : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`
      )
    : [];

  // expand.fixed_items contains expanded product records
  const fixedItems: Product[] = (record.expand?.fixed_items || []).map(
    (r: RecordModel) => mapProductRecord(r)
  );

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    type: record.type,
    description: record.description,
    shortDescription: record.short_description || record.shortDescription || '',
    boxPrice: record.box_price || 0,
    images: images.length > 0 ? images : ['/placeholder.png'],
    fixedItems,
    categoryId: record.category || undefined,
    isActive: record.is_active ?? true,
    collectionId: record.collectionId,
  };
}

// Get all ACTIVE gift boxes (for the landing page cards)
export async function getAllGiftBoxes(): Promise<GiftBox[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('gift_boxes').getFullList({
      filter: 'is_active=true',
      expand: 'fixed_items',
    });
    return records.map(mapRecordToGiftBox);
  } catch (error) {
    console.error('getAllGiftBoxes Error:', error);
    return [];
  }
}

// Get by slug — returns regardless of is_active so the page can show "unavailable"
async function getGiftBoxBySlug(slug: string): Promise<GiftBox | undefined> {
  try {
    const pb = createClient();
    const record = await pb
      .collection('gift_boxes')
      .getFirstListItem(`slug="${slug}"`, {
        expand: 'fixed_items',
      });
    return mapRecordToGiftBox(record);
  } catch (error) {
    console.error('getGiftBoxBySlug Error:', error);
    return undefined;
  }
}

// Get by type — returns regardless of is_active so the page can show "unavailable"
export async function getGiftBoxByType(
  type: 'birthday' | 'anniversary' | 'custom'
): Promise<GiftBox | undefined> {
  try {
    const pb = createClient();
    const record = await pb
      .collection('gift_boxes')
      .getFirstListItem(`type="${type}"`, {
        expand: 'fixed_items',
      });
    return mapRecordToGiftBox(record);
  } catch (error) {
    console.error('getGiftBoxByType Error:', error);
    return undefined;
  }
}
