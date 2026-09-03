import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const priceFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (price: number) => {
  return priceFormatter.format(price).replace('PKR', 'Rs.');
};

export const calculateDiscount = (price: number, originalPrice: number) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const formatDate = (date: string) => {
  return dateFormatter.format(new Date(date));
};

export const isProductAvailable = (product: { quantity?: number; inStock?: boolean; inventoryMode?: 'global' | 'color'; colorStock?: Record<string, number> }) => {
  // Authoritative availability is driven by quantity, not inStock cache.
  return Number(product.quantity) > 0;
};

export const getAvailableProductStock = (product: { inventoryMode?: string, quantity?: number, colorStock?: Record<string, number> }, selectedColor?: string): number => {
  if (product.inventoryMode === 'color') {
    if (!selectedColor) return 0;
    return product.colorStock?.[selectedColor] ?? 0;
  }
  return product.quantity ?? 0;
};

export function formatOrderAddress(street?: string, city?: string, zip?: string, country?: string): string {
  return [street, city, zip, country]
    .map(val => val && typeof val === 'string' ? val.trim() : '')
    .filter(val => val !== '' && val !== '00000' && val !== '0000')
    .join(', ');
}
