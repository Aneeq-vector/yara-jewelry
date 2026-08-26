import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getAllGiftBoxes, getGiftBoxByType } from '@/lib/data/gift-boxes';
import { createClient, PB_URL } from '@/lib/pocketbase';
import { GiftBox } from '@/types';

export function useGiftBoxes(initialData?: GiftBox[]) {
  return useQuery({
    queryKey: queryKeys.giftBoxes.all(),
    queryFn: () => getAllGiftBoxes(),
    initialData,
    staleTime: 60 * 1000, // 60 seconds
  });
}

export function useGiftBoxByType(type: 'birthday' | 'anniversary' | 'custom', initialData?: GiftBox | null) {
  return useQuery({
    queryKey: queryKeys.giftBoxes.byType(type),
    queryFn: () => getGiftBoxByType(type),
    initialData: initialData ?? undefined,
    staleTime: 60 * 1000,
  });
}

export function useAdminGiftBoxes(initialData?: any[]) {
  return useQuery({
    queryKey: queryKeys.admin.giftBoxes.all(),
    queryFn: async () => {
      const pb = createClient();
      const rawBoxes = await pb.collection('gift_boxes').getFullList({ expand: 'fixed_items', $autoCancel: false });
      return rawBoxes.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        slug: r.slug,
        description: r.description,
        box_price: r.box_price,
        images: (r.images || []).map((fn: string) => 
          fn.startsWith('http') ? fn : `${PB_URL}/api/files/${r.collectionId}/${r.id}/${encodeURIComponent(fn)}`
        ),
        imageFiles: r.images || [],
        fixed_items: r.fixed_items || [],
        category: Array.isArray(r.category) ? r.category[0] || '' : r.category || '',
        is_active: r.is_active ?? true,
        collectionId: r.collectionId,
      }));
    },
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useGiftBoxById(id: string, initialData?: GiftBox | null) {
  return useQuery({
    queryKey: queryKeys.giftBoxes.detail(id),
    queryFn: () => import('@/lib/data/gift-boxes').then(m => m.getGiftBoxById(id)),
    initialData: initialData ?? undefined,
    staleTime: 60 * 1000,
  });
}
