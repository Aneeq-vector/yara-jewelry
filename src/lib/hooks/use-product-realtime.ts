'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { createRealtimeClient } from '@/lib/pocketbase';
import { queryKeys } from '@/lib/query-keys';
import { mapRecordToProduct, getProductById } from '@/lib/data/products';

async function handleProductEvent(
  e: { action: string; record: any },
  queryClient: QueryClient
) {
  // Process ALL events to correctly invalidate caches

  if (e.action === 'update') {
    const isNowHidden = e.record.isStaged || e.record.isHidden;
    
    let updated = mapRecordToProduct(e.record);
    if (!e.record.expand?.category) {
      const fullRecord = await getProductById(e.record.id);
      if (fullRecord) {
        updated = fullRecord;
      }
    }

    const detailKey = queryKeys.products.detail(e.record.id);
    if (queryClient.getQueryData(detailKey)) {
      if (isNowHidden) {
        // detail should become unavailable immediately for currently open pages
        queryClient.setQueryData(detailKey, undefined);
        queryClient.invalidateQueries({ queryKey: detailKey }); // ensure it's marked as stale/refetched if needed
      } else {
        queryClient.setQueryData(detailKey, updated);
      }
    }

    // Always aggressively invalidate the full public family to ensure 
    // related, search, trending, options, and lists all stay in sync
    // without refetchType: 'none'.
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });

  } else if (e.action === 'create') {
    if (e.record.isStaged || e.record.isHidden) return; // Do not expose new hidden/staged publicly

    queryClient.invalidateQueries({ queryKey: queryKeys.products.catalog() });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.options() });
    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
    });
  } else if (e.action === 'delete') {
    const deletedId = e.record.id;
    queryClient.removeQueries({ queryKey: queryKeys.products.detail(deletedId) });

    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) =>
        old.filter((p) => p.id !== deletedId)
      );
    }

    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) =>
        old.filter((p) => p.id !== deletedId)
      );
    }

    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
    });
  }
}

export function useShopRealtime() {
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const pb = createRealtimeClient();
    let disposed = false;

    const productSub = pb.collection('products').subscribe('*', (e) => {
      if (!disposed) {
        handleProductEvent(e, queryClient);
      }
    }, { expand: 'category' });

    const categorySub = pb.collection('categories').subscribe('*', (e) => {
      if (!disposed) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      }
    });

    Promise.all([productSub, categorySub]).catch(err => {
      console.warn('Public realtime subscription failed:', err);
    });

    return () => {
      disposed = true;
      pb.realtime.unsubscribe();
      subscribedRef.current = false;
    };
  }, [queryClient]);
}

export function useGiftBoxRealtime() {
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const pb = createRealtimeClient();
    let disposed = false;

    const gbSub = pb.collection('gift_boxes').subscribe('*', (e) => {
      if (!disposed) {
        if (e.action === 'delete') {
          queryClient.removeQueries({ queryKey: queryKeys.giftBoxes.detail(e.record.id) });
        }
        // Invalidate all gift box queries (lists and details via prefix)
        queryClient.invalidateQueries({ queryKey: queryKeys.giftBoxes.all() });
      }
    });

    const productSub = pb.collection('products').subscribe('*', (e) => {
      if (!disposed) {
        handleProductEvent(e, queryClient);
        // Products are embedded in gift boxes, invalidate gift boxes when products change
        queryClient.invalidateQueries({ queryKey: queryKeys.giftBoxes.all() });
      }
    }, { expand: 'category' });

    Promise.all([gbSub, productSub]).catch(err => {
      console.warn('Gift box realtime subscription failed:', err);
    });

    return () => {
      disposed = true;
      pb.realtime.unsubscribe();
      subscribedRef.current = false;
    };
  }, [queryClient]);
}
