'use client';
import { useShopRealtime } from '@/lib/hooks/use-product-realtime';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  useShopRealtime();
  return <>{children}</>; // No wrapping UI — purely a subscription boundary
}
