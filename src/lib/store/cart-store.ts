'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, isCustomBox?: boolean, boxItems?: Product[], customPrice?: number, giftBoxType?: 'fixed' | 'custom', giftBoxId?: string) => { success: boolean, message?: string };
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => { success: boolean, message?: string };
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getCartProductQuantity: (productId: string, color?: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      getCartProductQuantity: (productId: string, color?: string) => {
        return get().items.reduce((total, item) => {
          if (!item.isCustomBox && item.product.id === productId && (color ? item.selectedColor === color : true)) {
            return total + item.quantity;
          }
          return total;
        }, 0);
      },
      addItem: (product, quantity = 1, color, isCustomBox, boxItems, customPrice, giftBoxType, giftBoxId) => {
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
                giftBoxType,
                giftBoxId,
                boxItems,
                customPrice,
              },
            ],
          });
          return { success: true };
        }

        const currentQtyInCart = get().getCartProductQuantity(product.id, color);
        const maxStock = product.inventoryMode === 'color' && color && product.colorStock 
            ? (product.colorStock[color] || 0) 
            : product.quantity;
            
        const remainingStock = Math.max(0, maxStock - currentQtyInCart);

        if (quantity > remainingStock) {
          if (remainingStock === 0) {
            return { success: false, message: `Only ${maxStock} available. You already have ${currentQtyInCart} in your cart.` };
          } else {
            return { success: false, message: `Only ${remainingStock} more available to add.` };
          }
        }

        // Merge same standard product matching selected color differences as per requirements
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
        
        return { success: true };
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return { success: true };
        }
        
        const itemToUpdate = get().items.find(i => i.cartItemId === cartItemId);
        if (!itemToUpdate) return { success: false, message: 'Item not found' };
        
        if (itemToUpdate.isCustomBox) {
           set({
            items: get().items.map((item) =>
              item.cartItemId === cartItemId 
                ? { ...item, quantity } 
                : item
            ),
          });
          return { success: true };
        }

        // Calculate total of ALL instances of this product & color minus this specific cart item's current qty
        const otherQty = get().items.reduce((total, item) => {
          if (!item.isCustomBox && item.product.id === itemToUpdate.product.id && item.selectedColor === itemToUpdate.selectedColor && item.cartItemId !== cartItemId) {
            return total + item.quantity;
          }
          return total;
        }, 0);
        
        const maxStock = itemToUpdate.product.inventoryMode === 'color' && itemToUpdate.selectedColor && itemToUpdate.product.colorStock 
            ? (itemToUpdate.product.colorStock[itemToUpdate.selectedColor] || 0) 
            : itemToUpdate.product.quantity;

        const remainingStockForThisItem = Math.max(0, maxStock - otherQty);
        
        if (quantity > remainingStockForThisItem) {
           return { success: false, message: `Cannot exceed available stock of ${maxStock}` };
        }
        
        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId 
              ? { ...item, quantity: quantity } 
              : item
          ),
        });
        
        return { success: true };
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Merge duplicate cart items on load
        const merged: CartItem[] = [];
        for (const item of state.items) {
          if (item.isCustomBox) {
            merged.push(item);
          } else {
            const existing = merged.find(i => !i.isCustomBox && i.product.id === item.product.id && i.selectedColor === item.selectedColor);
            if (existing) {
              existing.quantity += item.quantity;
              
              const maxStock = existing.product.inventoryMode === 'color' && existing.selectedColor && existing.product.colorStock 
                  ? (existing.product.colorStock[existing.selectedColor] || 0) 
                  : existing.product.quantity;
                  
              // Cap at max stock
              if (existing.quantity > maxStock) {
                 existing.quantity = maxStock;
              }
            } else {
              const maxStock = item.product.inventoryMode === 'color' && item.selectedColor && item.product.colorStock 
                  ? (item.product.colorStock[item.selectedColor] || 0) 
                  : item.product.quantity;
              // Cap at max stock
              if (item.quantity > maxStock) {
                item.quantity = maxStock;
              }
              merged.push({...item});
            }
          }
        }
        state.items = merged;
      }
    }
  )
);
