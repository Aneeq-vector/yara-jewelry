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
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, product] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
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
    }),
    {
      name: 'yara-wishlist',
    }
  )
);
