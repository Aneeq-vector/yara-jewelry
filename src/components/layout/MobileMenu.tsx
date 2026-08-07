import Link from 'next/link';
import { m } from 'framer-motion';
import { X, User, ShoppingBag, LogOut } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

interface MobileMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  user: any;
}

export function MobileMenu({ mobileOpen, setMobileOpen, isAuthenticated, user }: MobileMenuProps) {
  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ivory">
      <div className="flex items-center justify-between p-4 border-b border-nude/40">
        <span className="font-heading text-xl font-bold text-burgundy">Menu</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-2 -mr-2 rounded-full hover:bg-champagne/60 text-burgundy/60 hover:text-burgundy"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col p-4 space-y-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"
          >
            {link.label}
          </Link>
        ))}
        
        <div className="h-px bg-nude/40 my-4" />

        {isAuthenticated ? (
          <>
            <Link
              href={user?.role === 'admin' ? '/yara-admin' : '/account'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"
            >
              <User size={20} />
              {user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
            </Link>
          </>
        ) : (
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"
          >
            <User size={20} />
            Sign In
          </Link>
        )}
      </nav>
    </div>
  );
}
