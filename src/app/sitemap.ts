import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/pocketbase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yarasl.shop';

  // Static URLs with appropriate priorities and change frequencies
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/gift-boxes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gift-boxes/customize`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/care-instructions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/shipping-returns`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let dynamicUrls: MetadataRoute.Sitemap = [];

  try {
    const pb = createClient();
    
    // Fetch all products. 
    // Optimization: only request id and updated fields to reduce payload.
    const products = await pb.collection('products').getFullList({
      fields: 'id,updated',
      $autoCancel: false,
      filter: 'isStaged != true && isHidden != true',
    });

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updated ? new Date(product.updated) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Fetch active fixed gift boxes
    const giftBoxes = await pb.collection('gift_boxes').getFullList({
      filter: 'is_active = true',
      fields: 'id,updated,type',
      $autoCancel: false,
      
    });

    const giftBoxUrls = giftBoxes
      .filter((box) => box.type !== 'custom') // custom uses /gift-boxes/customize static route
      .map((box) => ({
        url: `${baseUrl}/gift-boxes/${box.id}`,
        lastModified: box.updated ? new Date(box.updated) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    dynamicUrls = [...productUrls, ...giftBoxUrls];
  } catch (error) {
    console.error('Sitemap generation: PocketBase fetch failed.', error);
    // Silent fail for dynamic urls so static urls can still be returned
  }

  return [...staticUrls, ...dynamicUrls];
}
