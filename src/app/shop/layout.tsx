'use client';
import { usePublicProductRealtime } from '@/lib/hooks/use-product-realtime';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  usePublicProductRealtime();
  return <>{children}</>; // No wrapping UI — purely a subscription boundary
}
