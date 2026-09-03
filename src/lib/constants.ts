import { NavLink } from '@/types';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const BRAND = {
  name: 'Yara',
  tagline: 'Crafted For Elegance',
  description: 'Premium imitation jewelry designed to elevate every moment.',
  email: 'contactyarasl@gmail.com',
  phone: '+94 70 733 7711',
  whatsapp: '+94707337711',
  instagram: 'https://instagram.com/yarashop_sl',
  tiktok: 'https://tiktok.com/@yarashop_sl',
  facebook: 'https://facebook.com/yarajewelry',
  pinterest: 'https://pinterest.com/yarajewelry',
} as const;

const COLORS = {
  burgundy: '#4B0F12',
  wine: '#5D1217',
  champagne: '#F6EBDD',
  ivory: '#FFF9F3',
  nude: '#E9DCCF',
  roseGold: '#B76E79',
  roseGoldLight: '#E8C4B0',
  pearl: '#FEFEFE',
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
  { label: 'Gift Boxes', href: '/gift-boxes' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_LINKS = {
  shop: [
    { label: 'Earrings', href: '/shop?category=earrings' },
    { label: 'Necklaces', href: '/shop?category=necklaces' },
    { label: 'Rings', href: '/shop?category=rings' },
    { label: 'Bracelets', href: '/shop?category=bracelets' },
    { label: 'Sets', href: '/shop?category=sets' },
    { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
    { label: 'Gift Boxes', href: '/gift-boxes' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '#' },
  ],
  support: [
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Care Instructions', href: '/care-instructions' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
  ],
};

export const BADGE_CONFIG = {
  trending: { label: 'Trending', color: 'bg-gradient-to-r from-rose-400 to-pink-500' },
  'best-seller': { label: 'Best Seller', color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
  limited: { label: 'Limited Stock', color: 'bg-gradient-to-r from-red-400 to-rose-500' },
  new: { label: 'New', color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
} as const;
export const SHIPPING_FEE = 450;
