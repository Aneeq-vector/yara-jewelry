import { getProductById, getAllProducts, getProductsByCategory } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import ProductDetailClient from './_ProductDetailClient';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { Product } from '@/types';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    return {
      title: 'Product Not Found | Yara Jewelry',
    };
  }
  
  return {
    title: `${product.name} | Yara Jewelry`,
    description: product.shortDescription || product.description,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  
  // 1. Fetch product and categories in parallel
  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);

  if (!product) {
    notFound();
  }

  // 2. Fetch related products (dependent on product.categoryId)
  let relatedProducts: Product[] = [];
  if (product.categoryId) {
    relatedProducts = await getProductsByCategory(product.categoryId, 8);
  }

  // 3. Fetch all products ONLY if it's the custom box builder
  let allProducts = undefined;
  if (product.name.toLowerCase() === 'build your own gift box') {
    allProducts = await getAllProducts();
  }

  return (
    <ProductDetailClient 
      id={id}
      initialProduct={product}
      initialCategories={categories}
      initialRelatedProducts={relatedProducts}
      initialAllProducts={allProducts}
    />
  );
}
