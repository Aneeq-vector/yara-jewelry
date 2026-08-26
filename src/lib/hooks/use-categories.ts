import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/data/categories';
import { queryKeys } from '@/lib/query-keys';
import { Category } from '@/types';

export function useCategories(initialData?: Category[]) {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => getAllCategories(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...(initialData ? { initialData } : {}),
  });
}
