import { Metadata, ResolvingMetadata } from 'next';
import { getProductById } from '@/lib/data/products';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const productImages = product.images.length > 0 ? product.images : previousImages;

  return {
    title: product.name,
    description: product.shortDescription || product.description?.substring(0, 160) || 'Discover elegant jewelry at Yara.',
    alternates: {
      canonical: `https://yarasl.shop/shop/${id}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.substring(0, 160) || 'Discover elegant jewelry at Yara.',
      url: `https://yarasl.shop/shop/${id}`,
      images: productImages,
      type: 'website',
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
