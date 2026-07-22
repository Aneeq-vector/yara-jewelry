import { Product } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

export const products: Product[] = [];

// Helper to map PocketBase record to Product type
export function mapRecordToProduct(record: RecordModel): Product {
  const images = (record.images || []).map(
    (filename: string) => filename.startsWith('http') || filename.startsWith('/') ? filename : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
  );

  return {
    id: record.id,
    productCode: record.productCode || record.id.substring(0, 8).toUpperCase(),
    name: record.name,
    price: record.price,
    originalPrice: record.originalPrice,
    description: record.description,
    shortDescription: record.shortDescription,
    category: record.expand?.category?.name || record.category as any,
    images: images.length > 0 ? images : ['/placeholder.png'],
    badge: record.badge || undefined,
    rating: record.rating || 0,
    reviewCount: record.reviewCount || 0,
    material: record.material || '',
    weight: record.weight || '',
    inStock: record.inStock ?? true,
    isActive: record.is_active ?? true,
    colors: record.colors || [],
    tags: record.tags || [],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getFullList({
      expand: 'category',
      $autoCancel: false,
      timestamp: Date.now() // Cache busting
    });
    return records.map(mapRecordToProduct);
  } catch (error) {
    console.error('getAllProducts Error:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const pb = createClient();
    const record = await pb.collection('products').getOne(id, {
      expand: 'category'
    });
    return mapRecordToProduct(record);
  } catch (error) {
    
    return undefined;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getFullList({
      filter: `category="${category}"`,
      expand: 'category'
    });
    return records.map(mapRecordToProduct);
  } catch (error) {
    
    return [];
  }
}

const TRENDING_SLOTS = 4;

export async function getTrendingProducts(): Promise<Product[]> {
  try {
    const pb = createClient();

    // Fetch trending/best-seller in-stock products first
    const trendingRecords = await pb.collection('products').getList(1, TRENDING_SLOTS, {
      filter: '(badge="trending" || badge="best-seller") && inStock=true',
      expand: 'category'
    });
    const trending = trendingRecords.items.map(mapRecordToProduct);

    // If we already have enough, return them
    if (trending.length >= TRENDING_SLOTS) return trending;

    // Backfill with any other in-stock products not already in the list
    const trendingIds = trending.map((p) => p.id);
    const needed = TRENDING_SLOTS - trending.length;
    const idFilter = trendingIds.length > 0
      ? trendingIds.map((id) => `id!="${id}"`).join(' && ') + ' && '
      : '';
    const backfillRecords = await pb.collection('products').getList(1, needed, {
      filter: `${idFilter}inStock=true`,
      expand: 'category'
    });
    const backfill = backfillRecords.items.map(mapRecordToProduct);

    return [...trending, ...backfill];
  } catch (error) {
    return [];
  }
}

export async function getNewArrivals(): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getList(1, 8, {
      filter: '(badge="new" || category="new-arrivals") && inStock=true',
      expand: 'category'
    });
    return records.items.map(mapRecordToProduct);
  } catch (error) {
    
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getFullList({
      filter: `name ~ "${query}" || shortDescription ~ "${query}" || tags ~ "${query}"`,
      expand: 'category'
    });
    return records.map(mapRecordToProduct);
  } catch (error) {
    
    return [];
  }
}
