'use client';

import { useEffect, useRef } from 'react';
import { createRealtimeClient } from '@/lib/pocketbase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export default function CustomerRealtimeProvider({
  authToken,
  userId,
  children,
}: {
  authToken: string | null;
  userId: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const pbRef = useRef<any>(null);

  useEffect(() => {
    if (!authToken || !userId) {
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

    const setupSubscriptions = async () => {
      try {
        await pb.collection('orders').subscribe('*', (e) => {

          if (
            e.action === 'create' ||
            e.action === 'update' ||
            e.action === 'delete'
          ) {
            if (!e.record.user || e.record.user === userId) {
              queryClient.invalidateQueries({ queryKey: queryKeys.orders.user(userId) });
            }
          }
        });
      } catch (err: any) {
        console.error('[CustomerRealtime] Subscription error:', err);
      }
    };

    setupSubscriptions();

    return () => {
      pb.realtime.unsubscribe();
      pb.authStore.clear();
      pbRef.current = null;
    };
  }, [authToken, userId, queryClient]);

  return <>{children}</>;
}
