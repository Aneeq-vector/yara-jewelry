import { Category } from '@/types';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

export const categories: Category[] = [
  {
    id: 'mock-cat-1',
    name: 'Necklaces',
    slug: 'necklaces' as any,
    description: 'Elegant necklaces for every occasion.',
    image: '/images/mock-imgs/necklace/necklace1.jpg',
    productCount: 15
  },
  {
    id: 'mock-cat-2',
    name: 'Rings',
    slug: 'rings' as any,
    description: 'Beautiful rings crafted with perfection.',
    image: '/images/mock-imgs/rings/ring1.jpg',
    productCount: 24
  },
  {
    id: 'mock-cat-3',
    name: 'Earrings',
    slug: 'earrings' as any,
    description: 'Stunning earrings to match your style.',
    image: '/images/mock-imgs/earings/earing1.jpg',
    productCount: 12
  }
];

// Helper to map PocketBase record to Category type
function mapRecordToCategory(record: RecordModel): Category {
  const getFallbackImage = (slug: string) => {
    switch (slug) {
      case 'necklaces': return '/images/mock-imgs/necklace/necklace1.jpg';
      case 'rings': return '/images/mock-imgs/rings/ring1.jpg';
      case 'earrings': return '/images/mock-imgs/earings/earing1.jpg';
      case 'bracelets': return '/images/mock-imgs/bracelets/bracelet1.jpg';
      case 'anklets':
      case 'anklet': return '/images/mock-imgs/anklet/ankler1.jpg';
      default: return '/placeholder.png';
    }
  };

  const imageUrl = record.image 
    ? (record.image.startsWith('http') || record.image.startsWith('/') 
        ? record.image 
        : `${PB_URL}/api/files/${record.collectionId}/${record.id}/${record.image}`)
    : getFallbackImage(record.slug);

  return {
    id: record.id,
    name: record.name,
    slug: record.slug as any,
    description: record.description,
    image: imageUrl,
    productCount: record.productCount || 0,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const pb = createClient();
    const records = await pb.collection('categories').getFullList();
    return records.map(mapRecordToCategory);
  } catch (error) {
    console.error('getAllCategories Error:', error);
    return categories;
  }
}
