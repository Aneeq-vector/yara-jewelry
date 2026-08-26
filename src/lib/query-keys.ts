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
    detail: (id: string) => ['giftBoxes', 'detail', id] as const,
  },

  // Admin-scoped — cleared on admin logout
  admin: {
    products: {
      all: () => ['admin', 'products'] as const,
      list: (filters: AdminProductFilters) => ['admin', 'products', filters] as const,
    },
    orders: {
      all: () => ['admin', 'orders'] as const,
      list: (page: number, perPage: number) => ['admin', 'orders', page, perPage] as const,
    },
    customers: {
      all: () => ['admin', 'customers'] as const,
      list: (filters: CustomerFilters) => ['admin', 'customers', filters] as const,
    },
    giftBoxes: {
      all: () => ['admin', 'giftBoxes'] as const,
    },
    categories: {
      all: () => ['admin', 'categories'] as const,
      productsAll: () => ['admin', 'categories', 'products'] as const,
      products: (categoryId: string, filters?: any) => ['admin', 'categories', 'products', categoryId, filters] as const,
      assignableProducts: (categoryId: string, filters?: any) => ['admin', 'categories', 'assignableProducts', categoryId, filters] as const,
    },
    dashboard: {
      stats: () => ['admin', 'dashboard', 'stats'] as const,
      recentOrders: () => ['admin', 'dashboard', 'recentOrders'] as const,
      topProducts: () => ['admin', 'dashboard', 'topProducts'] as const,
      lowStock: () => ['admin', 'dashboard', 'lowStock'] as const,
    }
  },

  // User-scoped — cleared on customer logout
  wishlist: (userId: string) => ['wishlist', userId] as const,
  addresses: (userId: string) => ['addresses', userId] as const,
  orders: {
    user: (userId: string) => ['orders', 'user', userId] as const,
  },
};
