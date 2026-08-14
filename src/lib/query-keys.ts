// Filters and params used in queries
export interface ProductFilters {
  category?: string;
  search?: string;
}

export interface AdminProductFilters {
  page: number;
  perPage: number;
  search: string;
  categoryId: string;
  sort: string;
  inStock: string;
  badge: string;
}

export interface CustomerFilters {
  page: number;
  perPage: number;
  search: string;
  status: string;
}

export const queryKeys = {
  // Public — not user-scoped
  products: {
    all: () => ['products'] as const,
    catalog: () => ['products', 'catalog'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    trending: () => ['products', 'trending'] as const,
    options: () => ['products', 'options'] as const, // lightweight selector query
    related: (category: string, excludeId: string) =>
      ['products', 'related', category, excludeId] as const,
  },
  categories: {
    all: () => ['categories'] as const,
  },
  giftBoxes: {
    all: () => ['gift-boxes'] as const,
    byType: (type: string) => ['gift-boxes', type] as const,
  },

  // Admin-scoped — cleared on admin logout
  admin: {
    products: (filters: AdminProductFilters) => ['admin', 'products', filters] as const,
    orders: (page: number, perPage: number) => ['admin', 'orders', page, perPage] as const,
    customers: (filters: CustomerFilters) => ['admin', 'customers', filters] as const,
    categories: () => ['admin', 'categories'] as const,
  },

  // User-scoped — cleared on customer logout
  wishlist: (userId: string) => ['wishlist', userId] as const,
  addresses: (userId: string) => ['addresses', userId] as const,
  orders: {
    user: (userId: string) => ['orders', 'user', userId] as const,
  },
};
