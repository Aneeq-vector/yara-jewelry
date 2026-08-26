'use client';

import { useGiftBoxRealtime } from '@/lib/hooks/use-product-realtime';

export default function GiftBoxesLayout({ children }: { children: React.ReactNode }) {
  useGiftBoxRealtime();
  return <>{children}</>;
}
