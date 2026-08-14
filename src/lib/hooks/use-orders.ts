import { useQuery } from '@tanstack/react-query';
import { getAllOrdersAction } from '@/app/actions/orders';
import { queryKeys } from '@/lib/query-keys';

export function useAdminOrders(page: number, perPage: number) {
  return useQuery({
    queryKey: queryKeys.admin.orders(page, perPage),
    queryFn: () => getAllOrdersAction(page, perPage),
    staleTime: 0,
  });
}
