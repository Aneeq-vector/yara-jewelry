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
