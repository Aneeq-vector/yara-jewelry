import { Product } from '@/types';
import { isProductAvailable } from '@/lib/utils';
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
    colors: Array.isArray(record.colors) ? record.colors : [],
    customColors: Array.isArray(record.customColors) ? record.customColors : [],
    inventoryMode: record.inventoryMode || 'global',
    colorStock: record.colorStock && typeof record.colorStock === 'object' ? record.colorStock : {},
    tags: record.tags || [],
    isHidden: record.isHidden ?? false,
    isStaged: record.isStaged ?? false,
    publishedAt: record.publishedAt || undefined,
    hasBeenPublished: record.hasBeenPublished ?? false,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getFullList({
      filter: 'isStaged = false && isHidden = false',
      expand: 'category',
      sort: '-id',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,shortDescription,description,badge,colors,customColors,inventoryMode,colorStock,tags,material,weight,publishedAt,hasBeenPublished,expand.category.id,expand.category.name',
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
      expand: 'category',
    });
    if (record.isStaged === true || record.isHidden === true) return undefined;
    return mapRecordToProduct(record);
  } catch (error) {
    
    return undefined;
  }
}

export async function getProductsByCategory(category: string, limit = 500): Promise<Product[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('products').getList(1, limit, {
      filter: `category="${category}" && isStaged = false && isHidden = false`,
      sort: '-id',
      $autoCancel: false,
      expand: 'category',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,shortDescription,description,badge,colors,customColors,inventoryMode,colorStock,tags,material,weight,publishedAt,hasBeenPublished,expand.category.id,expand.category.name',
    });
    const results = records.items.map(mapRecordToProduct);
    
    // JS sort available-first
    results.sort((a, b) => {
      const aAvail = isProductAvailable(a);
      const bAvail = isProductAvailable(b);
      if (aAvail && !bAvail) return -1;
      if (!aAvail && bAvail) return 1;
      return 0; // -created preserves the order
    });
    
    return results;
  } catch (error) {
    
    return [];
  }
}

async function getAvailableFirstLimitedProducts(baseFilter: string, limit: number, secondarySort = '-id'): Promise<Product[]> {
  const pb = createClient();
  
  // 1. Fetch IN-STOCK records first
  const availableFilter = `(${baseFilter}) && quantity > 0 && isStaged = false && isHidden = false`;
  const availableRecords = await pb.collection('products').getList(1, limit, {
    filter: availableFilter,
    sort: secondarySort,
    $autoCancel: false,
    expand: 'category'
  });
  
  let results = availableRecords.items.map(mapRecordToProduct);
  
  // 2. & 3. If fewer than limit, fetch OUT-OF-STOCK records
  if (results.length < limit) {
    const remainingLimit = limit - results.length;
    const outOfStockFilter = `(${baseFilter}) && quantity = 0 && isStaged = false && isHidden = false`;
    const outOfStockRecords = await pb.collection('products').getList(1, remainingLimit, {
      filter: outOfStockFilter,
      sort: secondarySort,
      $autoCancel: false,
      expand: 'category'
    });
    
    results = [...results, ...outOfStockRecords.items.map(mapRecordToProduct)];
  }
  
  return results;
}

const TRENDING_SLOTS = 4;

export async function getTrendingProducts(): Promise<Product[]> {
  try {
    return await getAvailableFirstLimitedProducts('badge="trending"', TRENDING_SLOTS, '-id');
  } catch (error) {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    return await getAvailableFirstLimitedProducts('badge="new" || category="new-arrivals"', 8, '-publishedAt,-id');
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
    const filter = terms.map(term => `name ~ "${term}"`).join(' && ') + ' && isStaged = false && isHidden = false';

    const records = await pb.collection('products').getFullList({
      sort: '-id',
      filter,
      $autoCancel: false,
      expand: 'category'
    });
    
    const results = records.map(mapRecordToProduct);
    
    // JS sort available-first for search results
    results.sort((a, b) => {
      const aAvail = isProductAvailable(a);
      const bAvail = isProductAvailable(b);
      if (aAvail && !bAvail) return -1;
      if (!aAvail && bAvail) return 1;
      return 0; // -created preserves the order
    });
    
    return results;
  } catch (error) {
    
    return [];
  }
}
