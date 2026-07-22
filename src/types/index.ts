export interface Product {
  id: string;
  productCode?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  category: CategoryType;
  images: string[];
  badge?: 'trending' | 'best-seller' | 'limited' | 'new';
  rating: number;
  reviewCount: number;
  material: string;
  weight: string;
  inStock: boolean;
  isActive?: boolean;
  colors?: string[];
  selectedColor?: string;
  tags: string[];
}

export type GiftBoxType = 'birthday' | 'anniversary' | 'custom';

export interface GiftBox {
  id: string;
  name: string;
  slug: string;
  type: GiftBoxType;
  description: string;
  shortDescription: string;
  boxPrice: number;
  images: string[];
  fixedItems: Product[];
  categoryId?: string;  // optional category relation for filtering fixed_items
  isActive: boolean;
  collectionId?: string;
}

export type CategoryType =
  | 'earrings'
  | 'necklaces'
  | 'rings'
  | 'bracelets'
  | 'sets'
  | 'gift-boxes'
  | 'new-arrivals';

export interface Category {
  id: string;
  name: string;
  slug: CategoryType;
  description: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  isCustomBox?: boolean;
  boxItems?: Product[];
  customPrice?: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  trackingNumber?: string;
  address: Address;
}

export interface Testimonial {
  id: string;
  name: string;
  image: string;
  rating: number;
  comment: string;
  location: string;
}

export interface NavLink {
  label: string;
  href: string;
}
