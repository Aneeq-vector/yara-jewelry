import Link from 'next/link';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, User, ShoppingBag, LogOut, LayoutDashboard, Heart, Package, MapPin, Settings } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

interface MobileMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  user: any;
}

export function MobileMenu({ mobileOpen, setMobileOpen, isAuthenticated, user }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-burgundy/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-[400px] bg-ivory shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-nude/40">
              <span className="font-heading text-xl font-bold text-burgundy">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-champagne/60 text-burgundy/60 hover:text-burgundy"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-4 rounded-xl font-ui font-semibold text-lg text-burgundy hover:bg-champagne/40 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-nude/40 my-6" />

              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 mb-2">
                    <p className="font-ui font-bold text-burgundy text-sm">Account</p>
                    <p className="font-body text-xs text-burgundy/60 truncate">{user?.email}</p>
                  </div>
                  {user?.role === 'admin' ? (
                    <Link
                      href="/yara-admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"
                    >
                      <LayoutDashboard size={20} /> Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"><LayoutDashboard size={20} /> Dashboard</Link>
                      <Link href="/dashboard/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"><Package size={20} /> Orders</Link>
                      <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"><Heart size={20} /> Wishlist</Link>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-xl font-ui font-semibold text-burgundy hover:bg-champagne/40"
                >
                  <User size={20} />
                  Sign In / Register
                </Link>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
