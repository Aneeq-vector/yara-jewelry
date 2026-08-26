import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCustomersAction } from '@/app/actions/customers';
import { queryKeys, CustomerFilters } from '@/lib/query-keys';

export function useAdminCustomers(filters: CustomerFilters, initialData?: any) {
  return useQuery({
    queryKey: queryKeys.admin.customers.list(filters),
    queryFn: () => getCustomersAction(
      filters.page,
      filters.perPage,
      filters.search,
      filters.status
    ),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    ...(initialData ? { initialData } : {}),
  });
}
