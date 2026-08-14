import { useQuery } from '@tanstack/react-query';
import { getCustomersAction } from '@/app/actions/customers';
import { queryKeys, CustomerFilters } from '@/lib/query-keys';

export function useAdminCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.admin.customers(filters),
    queryFn: () => getCustomersAction(
      filters.page,
      filters.perPage,
      filters.search,
      filters.status
    ),
    staleTime: 0,
  });
}
