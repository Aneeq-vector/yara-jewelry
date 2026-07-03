'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, isCustomBox?: boolean, boxItems?: Product[], customPrice?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, color, isCustomBox, boxItems, customPrice) => {
        const items = get().items;
        
        if (isCustomBox) {
          // Custom boxes are always treated as unique items
          set({
            items: [
              ...items,
              {
                cartItemId: crypto.randomUUID(),
                product,
                quantity,
                selectedColor: color,
                isCustomBox,
                boxItems,
                customPrice,
              },
            ],
          });
          return;
        }

        const existing = items.find(
          (item) => !item.isCustomBox && item.product.id === product.id && item.selectedColor === color
        );
        if (existing) {
          set({
            items: items.map((item) =>
              item.cartItemId === existing.cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                cartItemId: crypto.randomUUID(),
                product,
                quantity,
                selectedColor: color,
              },
            ],
          });
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.customPrice ?? item.product.price) * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'yara-cart',
    }
  )
);
