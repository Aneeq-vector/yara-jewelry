import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserWishlistAction, 
  addToWishlistAction, 
  removeFromWishlistAction,
  syncWishlistAction
} from '@/app/actions/wishlist';
import { queryKeys } from '@/lib/query-keys';
import { Product } from '@/types';

export function useUserWishlist() {
  return useQuery({
    queryKey: queryKeys.wishlist('current'),
    queryFn: async () => {
      const res = await getUserWishlistAction();
      if (!res.success) throw new Error(res.error || 'Failed to fetch wishlist');
      return res.items as Product[];
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await addToWishlistAction(productId);
      if (!res.success) throw new Error(res.error || 'Failed to add to wishlist');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist('current') });
    }
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await removeFromWishlistAction(productId);
      if (!res.success) throw new Error(res.error || 'Failed to remove from wishlist');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist('current') });
    }
  });
}

export function useSyncWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (localProductIds: string[]) => {
      const res = await syncWishlistAction(localProductIds);
      if (!res.success) throw new Error(res.error || 'Failed to sync wishlist');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist('current') });
    }
  });
}
