'use client';

import { useEffect, useRef } from 'react';
import { createRealtimeClient } from '@/lib/pocketbase';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/store/admin-auth-store';

import { queryKeys } from '@/lib/query-keys';

export default function AdminRealtimeProvider({
  authToken,
  children,
}: {
  authToken: string | null;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pbRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authToken) {
      if (pbRef.current) {
        pbRef.current.authStore.clear();
        pbRef.current.realtime.unsubscribe();
        pbRef.current = null;
      }
      return;
    }

    const pb = createRealtimeClient();
    pb.authStore.save(authToken, null);
    pbRef.current = pb;

    const handleAuthFailure = () => {
      console.warn('[AdminRealtime] Realtime authentication or connection failed. Retrying in background...');
    };



    pb.realtime.subscribe('', (e) => {}).catch(err => {
      if (err?.status === 401 || err?.status === 403) {
         handleAuthFailure();
      }
    });

    const triggerDashboardDebounce = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        // Targeted refetches
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.stats() });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.recentOrders() });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.topProducts() });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard.lowStock() });
      }, 300);
    };

    const setupSubscriptions = async () => {
      try {
        await pb.collection('orders').subscribe('*', (e) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all() });
          triggerDashboardDebounce();
        });

        await pb.collection('users').subscribe('*', (e) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all() });
          triggerDashboardDebounce();
        });

        await pb.collection('products').subscribe('*', (e) => {
          if (e.action === 'create') {
            const queries = queryClient.getQueriesData({ queryKey: ['admin', 'products'] });
            queries.forEach(([queryKey, data]: [any, any]) => {
              // Ensure it's a list query and has the filters object
              if (queryKey.length < 3) return;
              const filters = queryKey[2] as any;
              if (!filters || filters.page !== 1 || !data || !data.products) return;

              // Check if it matches active filters
              if (filters.categoryId && e.record.category !== filters.categoryId) return;
              if (filters.search) {
                const search = filters.search.toLowerCase();
                const nameMatch = e.record.name?.toLowerCase().includes(search);
                const codeMatch = e.record.productCode?.toLowerCase().includes(search);
                if (!nameMatch && !codeMatch) return;
              }
              if (filters.inStock === 'In Stock' && (e.record.quantity || 0) <= 0) return;
              if (filters.inStock === 'Out of Stock' && (e.record.quantity || 0) > 0) return;
              if (filters.badge && filters.badge !== 'All' && e.record.badge !== filters.badge) return;

              const rowsPerPage = filters.perPage || 50;

              queryClient.setQueryData(queryKey, (old: any) => {
                if (!old || !old.products) return old;
                
                const existingIds = new Set(old.products.map((p: any) => p.id));
                const alreadyExists = existingIds.has(e.record.id);
                
                let newItems = alreadyExists 
                  ? old.products.map((p: any) => p.id === e.record.id ? e.record : p)
                  : [e.record, ...old.products];

                newItems.sort((a: any, b: any) => {
                  const addedAtDiff = new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
                  if (addedAtDiff !== 0) return addedAtDiff;
                  return b.id > a.id ? 1 : -1;
                });
                
                newItems = newItems.slice(0, rowsPerPage);
                
                const newTotal = alreadyExists ? old.totalItems : old.totalItems + 1;
                const newTotalPages = Math.ceil(newTotal / rowsPerPage);
                
                return {
                  ...old,
                  products: newItems,
                  totalItems: newTotal,
                  totalPages: newTotalPages
                };
              });
            });
          }

          queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
          triggerDashboardDebounce();
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        });

        await pb.collection('gift_boxes').subscribe('*', (e) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.giftBoxes.all() });
          queryClient.invalidateQueries({ queryKey: queryKeys.giftBoxes.all() });
        });
        
        await pb.collection('categories').subscribe('*', (e) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all() });
          queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        });
        
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 403 || err?.originalError?.status === 401) {
          handleAuthFailure();
        } else {
          console.error('[AdminRealtime] Subscription error:', err);
        }
      }
    };

    setupSubscriptions();

    return () => {
      pb.realtime.unsubscribe();
      pb.authStore.clear();
      pbRef.current = null;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [authToken, queryClient, router]);

  return <>{children}</>;
}
