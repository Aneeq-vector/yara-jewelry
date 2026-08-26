import { useQuery } from '@tanstack/react-query';
import { getAllOrdersAction } from '@/app/actions/orders';
import { queryKeys } from '@/lib/query-keys';

export function useAdminOrders(page: number, perPage: number, initialData?: any) {
  return useQuery({
    queryKey: queryKeys.admin.orders.list(page, perPage),
    queryFn: () => getAllOrdersAction(page, perPage),
    initialData,
    staleTime: 0,
  });
}
