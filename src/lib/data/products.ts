import { Product } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

const products: Product[] = [];

// Helper to map PocketBase record to Product type
export function mapRecordToProduct(record: RecordModel): Product {
  const images = (record.images || []).map(
    (filename: string) => filename.startsWith('http') || filename.startsWith('/') ? filename : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`
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
    // Raw PocketBase relation ID — used for server-side relation filter queries.
    // record.category holds the ID string (e.g. "uyqn8vbdom0cym6") even when
    // the relation is expanded; record.expand.category.id is the canonical form.
    categoryId: record.expand?.category?.id || (typeof record.category === 'string' ? record.category : undefined),
    images: images.length > 0 ? images : ['/placeholder.png'],
    imagePositions: record.imagePositions || [],
    badge: record.badge || undefined,
    rating: record.rating || 0,
    reviewCount: record.reviewCount || 0,
    material: record.material || '',
    weight: record.weight || '',
    inStock: record.inStock ?? true,
    quantity: record.quantity ?? 0,
    isActive: record.is_active ?? true,
    colors: record.colors || [],
    customColors: record.customColors || [],
    inventoryMode: record.inventoryMode || 'global',
    colorStock: record.colorStock || {},
    tags: record.tags || [],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getFullList({
      expand: 'category',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,shortDescription,description,badge,colors,customColors,inventoryMode,colorStock,tags,material,weight,expand.category.id,expand.category.name',
      $autoCancel: false,
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
      $autoCancel: false,
      expand: 'category'
    });
    return mapRecordToProduct(record);
  } catch (error) {
    
    return undefined;
  }
}

export async function getProductsByCategory(category: string, limit = 500): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getList(1, limit, {
      filter: `category="${category}"`,
      $autoCancel: false,
      expand: 'category',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,shortDescription,description,badge,colors,customColors,inventoryMode,colorStock,tags,material,weight,expand.category.id,expand.category.name',
    });
    return records.items.map(mapRecordToProduct);
  } catch (error) {
    
    return [];
  }
}

const TRENDING_SLOTS = 4;

export async function getTrendingProducts(): Promise<Product[]> {
  try {
    const pb = createClient();

    // Fetch trending in-stock products
    const trendingRecords = await pb.collection('products').getList(1, TRENDING_SLOTS, {
      filter: 'badge="trending" && inStock=true',
      $autoCancel: false,
      expand: 'category'
    });
    return trendingRecords.items.map(mapRecordToProduct);
  } catch (error) {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getList(1, 8, {
      filter: '(badge="new" || category="new-arrivals") && inStock=true',
      $autoCancel: false,
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
    
    // Split the query into words, ignoring empty spaces
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];
    
    // Create a filter where each word must be present in the name
    const filter = terms.map(term => `name ~ "${term}"`).join(' && ');

    const records = await pb.collection('products').getFullList({
      filter,
      $autoCancel: false,
      expand: 'category'
    });
    return records.map(mapRecordToProduct);
  } catch (error) {
    
    return [];
  }
}
