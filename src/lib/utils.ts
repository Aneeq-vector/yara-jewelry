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
  // Respect the unified inventory logic - the authoritative stock is what dictates availability
  // (We use strictly inStock which is derived authoritatively on the server, ensuring it matches 1:1)
  return product.inStock === true;
};
