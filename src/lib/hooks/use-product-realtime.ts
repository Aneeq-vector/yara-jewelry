'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { createClient, createRealtimeClient } from '@/lib/pocketbase';
import { queryKeys } from '@/lib/query-keys';
import { mapRecordToProduct, getProductById } from '@/lib/data/products';

type RealtimeScope = 'admin' | 'public';

async function handleProductEvent(
  e: { action: string; record: any },
  queryClient: QueryClient,
  scope: RealtimeScope
) {
  if (e.action === 'update') {
    // If the realtime event is missing the expanded category relation (often true for proxy updates),
    // we must fetch the complete record to ensure the cache stays 100% accurate.
    let updated = mapRecordToProduct(e.record);
    if (!e.record.expand?.category) {
      const fullRecord = await getProductById(e.record.id);
      if (fullRecord) {
        updated = fullRecord;
      }
    }

    // ── Public cache surgical updates ──────────────────────────────
    // Update product detail if cached (both scopes)
    const detailKey = queryKeys.products.detail(e.record.id);
    if (queryClient.getQueryData(detailKey)) {
      queryClient.setQueryData(detailKey, updated);
    }

    // Patch updated record inside the full public products list if cached
    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) =>
        old.map((p) => (p.id === updated.id ? updated : p))
      );
    }

    // Patch product options cache if cached (requires raw record, not mapped Product)
    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) =>
        old.map((p) => (p.id === e.record.id ? { ...p, ...e.record } : p))
      );
    }

    // Mark related-product queries stale (category may have changed) —
    // do not immediately refetch; the next access triggers the fetch
    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });

    // ── Admin cache update ─────────────────────────────────────────
    if (scope === 'admin') {
      // Paginated admin list cannot be patched surgically (ordering may change)
      // Mark active queries stale and refetch immediately in background
      queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
        refetchType: 'active',
      });
    }

  } else if (e.action === 'create') {
    // New product — lists need to be refreshed; no surgical add (don't know correct sort position)
    queryClient.invalidateQueries({ queryKey: queryKeys.products.catalog() });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.options() });
    // Related queries may now include the new product if it shares a category
    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });
    if (scope === 'admin') {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
        refetchType: 'active',
      });
    }

  } else if (e.action === 'delete') {
    const deletedId = e.record.id;

    // Remove the detail cache entry entirely
    queryClient.removeQueries({ queryKey: queryKeys.products.detail(deletedId) });

    // Remove the deleted product from the full public list without a network request
    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) =>
        old.filter((p) => p.id !== deletedId)
      );
    }

    // Remove from product options cache if present
    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) =>
        old.filter((p) => p.id !== deletedId)
      );
    }

    // Invalidate related queries — deleted product may have been in them
    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });

    if (scope === 'admin') {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
        refetchType: 'active',
      });
    }
  }
}

export function useAdminProductRealtime() {
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const pb = createRealtimeClient();
    let disposed = false;

    const subscriptionPromise = pb.collection('products').subscribe(
      '*',
      (e) => {
        if (!disposed) {
          handleProductEvent(e, queryClient, 'admin');
        }
      },
      { expand: 'category' }
    );

    subscriptionPromise.catch(err => {
      console.warn('Admin realtime subscription failed:', err);
      return () => {};
    });

    return () => {
      disposed = true;
      subscriptionPromise
        .then((unsubscribe) => unsubscribe())
        .catch(() => {
          // Ignore cleanup errors
        });
      subscribedRef.current = false;
    };
  }, [queryClient]);
}

export function usePublicProductRealtime() {
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const pb = createRealtimeClient();
    let disposed = false;

    const subscriptionPromise = pb.collection('products').subscribe(
      '*',
      (e) => {
        if (!disposed) {
          handleProductEvent(e, queryClient, 'public');
        }
      },
      { expand: 'category' }
    );

    subscriptionPromise.catch(err => {
      console.warn('Public realtime subscription failed:', err);
      return () => {};
    });

    return () => {
      disposed = true;
      subscriptionPromise
        .then((unsubscribe) => unsubscribe())
        .catch(() => {
          // Ignore cleanup errors
        });
      subscribedRef.current = false;
    };
  }, [queryClient]);
}
