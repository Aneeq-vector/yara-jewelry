'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  setWishlist: (items: Product[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, product] });
          
          try {
            const { useAuthStore } = await import('./auth-store');
            if (useAuthStore.getState().isAuthenticated) {
              const { addToWishlistAction } = await import('@/app/actions/wishlist');
              await addToWishlistAction(product.id);
            }
          } catch (e) {
            console.error('Failed to sync add to wishlist', e);
          }
        }
      },
      removeItem: async (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        
        try {
          const { useAuthStore } = await import('./auth-store');
          if (useAuthStore.getState().isAuthenticated) {
            const { removeFromWishlistAction } = await import('@/app/actions/wishlist');
            await removeFromWishlistAction(productId);
          }
        } catch (e) {
          console.error('Failed to sync remove from wishlist', e);
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      clearWishlist: () => set({ items: [] }),
      setWishlist: (items) => set({ items }),
    }),
    {
      name: 'yara-wishlist',
    }
  )
);
