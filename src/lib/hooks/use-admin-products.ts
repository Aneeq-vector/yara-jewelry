import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductsAction, getCategoriesAction, getCategoryProductsAction, getAssignableProductsAction } from '@/app/actions/products';
import { queryKeys, AdminProductFilters } from '@/lib/query-keys';

export function useAdminProducts(filters: AdminProductFilters, initialData?: any) {
  return useQuery({
    queryKey: queryKeys.admin.products.list(filters),
    queryFn: () => getProductsAction(
      filters.page,
      filters.perPage,
      filters.search,
      filters.categoryId,
      filters.sort,
      filters.inStock,
      filters.badge
    ),
    initialData,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useAdminCategories(initialData?: any) {
  return useQuery({
    queryKey: queryKeys.admin.categories.all(),
    queryFn: () => getCategoriesAction(),
    initialData,
    staleTime: 60_000,
  });
}

import { createCategoryAction, updateCategoryAction, deleteCategoryAction, assignProductsToCategoryAction, removeProductFromCategoryAction, updateCategoryWithProductsAction } from '@/app/actions/categories';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string }) => createCategoryAction(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      }
    }
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: { name?: string; slug?: string; description?: string } }) => updateCategoryAction(id, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
        // Products might show updated category names if expanded in the response
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      }
    }
  });
}

export function useUpdateCategoryWithProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, data, addProducts, removeProducts 
    }: { 
      id: string, 
      data: { name?: string; slug?: string; description?: string },
      addProducts: string[],
      removeProducts: string[]
    }) => updateCategoryWithProductsAction(id, data, addProducts, removeProducts),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
        
        // Products were re-assigned, we need to invalidate category products
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.products(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.assignableProducts(variables.id) });
        
        // General product invalidation since products might show updated categories or have moved
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      }
    }
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      }
    }
  });
}

export function useCategoryProducts(categoryId: string, page = 1, perPage = 50) {
  return useQuery({
    queryKey: queryKeys.admin.categories.products(categoryId, { page, perPage }),
    queryFn: () => getCategoryProductsAction(categoryId, page, perPage),
    enabled: !!categoryId,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useAssignableCategoryProducts(categoryId: string, page = 1, perPage = 50, search = '') {
  return useQuery({
    queryKey: queryKeys.admin.categories.assignableProducts(categoryId, { page, perPage, search }),
    queryFn: () => getAssignableProductsAction(categoryId, page, perPage, search),
    enabled: !!categoryId,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useAssignProductsToCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productIds, categoryId }: { productIds: string[], categoryId: string }) => 
      assignProductsToCategoryAction(productIds, categoryId),
    onSuccess: (res) => {
      if (res.success) {
        // Targeted invalidation
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.productsAll() });
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'assignableProducts'] });
      }
    }
  });
}

export function useRemoveProductFromCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeProductFromCategoryAction(productId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.productsAll() });
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'assignableProducts'] });
      }
    }
  });
}
