import { GiftBox, Product } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

import { mapRecordToProduct } from './products';

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
    (r: RecordModel) => mapRecordToProduct(r)
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
      $autoCancel: false,
      filter: 'is_active=true',
      expand: 'fixed_items',
      fields: 'id,collectionId,name,slug,type,description,short_description,box_price,images,category,is_active,expand.fixed_items.id,expand.fixed_items.collectionId,expand.fixed_items.collectionName,expand.fixed_items.name,expand.fixed_items.price,expand.fixed_items.originalPrice,expand.fixed_items.description,expand.fixed_items.shortDescription,expand.fixed_items.category,expand.fixed_items.images,expand.fixed_items.badge,expand.fixed_items.rating,expand.fixed_items.reviewCount,expand.fixed_items.material,expand.fixed_items.weight,expand.fixed_items.inStock,expand.fixed_items.quantity,expand.fixed_items.colors,expand.fixed_items.tags'
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
        fields: 'id,collectionId,name,slug,type,description,short_description,box_price,images,category,is_active,expand.fixed_items.id,expand.fixed_items.collectionId,expand.fixed_items.collectionName,expand.fixed_items.name,expand.fixed_items.price,expand.fixed_items.originalPrice,expand.fixed_items.description,expand.fixed_items.shortDescription,expand.fixed_items.category,expand.fixed_items.images,expand.fixed_items.badge,expand.fixed_items.rating,expand.fixed_items.reviewCount,expand.fixed_items.material,expand.fixed_items.weight,expand.fixed_items.inStock,expand.fixed_items.quantity,expand.fixed_items.colors,expand.fixed_items.tags'
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
        fields: 'id,collectionId,name,slug,type,description,short_description,box_price,images,category,is_active,expand.fixed_items.id,expand.fixed_items.collectionId,expand.fixed_items.collectionName,expand.fixed_items.name,expand.fixed_items.price,expand.fixed_items.originalPrice,expand.fixed_items.description,expand.fixed_items.shortDescription,expand.fixed_items.category,expand.fixed_items.images,expand.fixed_items.badge,expand.fixed_items.rating,expand.fixed_items.reviewCount,expand.fixed_items.material,expand.fixed_items.weight,expand.fixed_items.inStock,expand.fixed_items.quantity,expand.fixed_items.colors,expand.fixed_items.tags'
      });
    return mapRecordToGiftBox(record);
  } catch (error) {
    console.error('getGiftBoxByType Error:', error);
    return undefined;
  }
}

export async function getGiftBoxById(id: string): Promise<GiftBox | undefined> {
  try {
    const pb = createClient();
    const record = await pb
      .collection('gift_boxes')
      .getOne(id, {
        expand: 'fixed_items',
        fields: 'id,collectionId,name,slug,type,description,short_description,box_price,images,category,is_active,expand.fixed_items.id,expand.fixed_items.collectionId,expand.fixed_items.collectionName,expand.fixed_items.name,expand.fixed_items.price,expand.fixed_items.originalPrice,expand.fixed_items.description,expand.fixed_items.shortDescription,expand.fixed_items.category,expand.fixed_items.images,expand.fixed_items.badge,expand.fixed_items.rating,expand.fixed_items.reviewCount,expand.fixed_items.material,expand.fixed_items.weight,expand.fixed_items.inStock,expand.fixed_items.quantity,expand.fixed_items.colors,expand.fixed_items.tags'
      });
    return mapRecordToGiftBox(record);
  } catch (error) {
    console.error('getGiftBoxById Error:', error);
    return undefined;
  }
}
