import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProductsAction, getCategoriesAction } from '@/app/actions/products';
import { queryKeys, AdminProductFilters } from '@/lib/query-keys';

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: queryKeys.admin.products(filters),
    queryFn: () => getProductsAction(
      filters.page,
      filters.perPage,
      filters.search,
      filters.categoryId,
      filters.sort,
      filters.inStock,
      filters.badge
    ),
    staleTime: 0, // Admin data should be fresh
    placeholderData: keepPreviousData,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories(),
    queryFn: () => getCategoriesAction(),
    staleTime: 60_000,
  });
}
