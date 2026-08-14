import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, getProductById, getProductsByCategory } from '@/lib/data/products';
import { deleteProductAction, deleteProductsAction, duplicateProductAction, getProductOptionsAction } from '@/app/actions/products';
import { queryKeys } from '@/lib/query-keys';

// Behavior-compatible: still loads full catalog, client-side filter/sort
export function useProducts(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.products.catalog(),
    queryFn: () => getAllProducts(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

export function useRelatedProducts(categoryId: string, excludeId: string) {
  return useQuery({
    queryKey: queryKeys.products.related(categoryId, excludeId),
    queryFn: () => getProductsByCategory(categoryId, 8),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    enabled: !!categoryId,
    select: (data) => data.filter(p => p.id !== excludeId).slice(0, 4),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteProductsAction(ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateProductAction(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useProductOptions() {
  return useQuery({
    queryKey: queryKeys.products.options(),
    queryFn: async () => {
      const res = await getProductOptionsAction();
      if (!res.success) throw new Error(res.error || 'Failed to fetch product options');
      return res.products as any[];
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
