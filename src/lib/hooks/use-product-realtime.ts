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
  if (e.record.isStaged) {
    return; // Ignore staged products entirely from realtime
  }

  if (e.action === 'update') {
    let updated = mapRecordToProduct(e.record);
    if (!e.record.expand?.category) {
      const fullRecord = await getProductById(e.record.id);
      if (fullRecord) {
        updated = fullRecord;
      }
    }

    const detailKey = queryKeys.products.detail(e.record.id);
    if (queryClient.getQueryData(detailKey)) {
      queryClient.setQueryData(detailKey, updated);
    }

    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) => {
        const exists = old.some(p => p.id === updated.id);
        if (exists) return old.map((p) => (p.id === updated.id ? updated : p));
        
        // If it was previously staged and just finalized, it won't be in the list.
        // We must invalidate to trigger a refetch, because appending might break pagination/sorting.
        queryClient.invalidateQueries({ queryKey: listKey });
        return old;
      });
    }

    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) => {
        const exists = old.some(p => p.id === updated.id);
        if (exists) return old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
        queryClient.invalidateQueries({ queryKey: optionsKey });
        return old;
      });
    }

    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });

  } else if (e.action === 'create') {
    let updated = mapRecordToProduct(e.record);
    if (!e.record.expand?.category) {
      const fullRecord = await getProductById(e.record.id);
      if (fullRecord) {
        updated = fullRecord;
      }
    }

    const detailKey = queryKeys.products.detail(e.record.id);
    if (queryClient.getQueryData(detailKey)) {
      queryClient.setQueryData(detailKey, updated);
    }

    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) =>
        old.map((p) => (p.id === updated.id ? updated : p))
      );
    }

    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) =>
        old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
    }

    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });

  } else if (e.action === 'create') {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.catalog() });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.options() });
    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
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
      refetchType: 'none',
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
