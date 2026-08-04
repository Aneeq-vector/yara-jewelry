'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuthStore } from '@/lib/store/auth-store';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/actions/auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Package, label: 'Orders', href: '/dashboard/orders' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasHydrated(useAuthStore.persist.hasHydrated());
    
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    
    return () => {
      unsub();
    };
  }, []);

  if (!isClient || !hasHydrated) return null;

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-champagne/50 flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-burgundy/30" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-3">Sign in to continue</h1>
          <p className="font-body text-burgundy/50 mb-8">Access your dashboard, orders, and wishlist.</p>
          <Link href="/auth/login" className="btn-primary inline-block"><span>Sign In</span></Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-heading text-4xl font-bold text-burgundy mb-2">
              Hello, {user?.name?.split(' ')[0]} ✨
            </h1>
            <p className="font-body text-burgundy/50">Welcome to your Yara dashboard.</p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Quick Stats & Menu */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Card Sidebar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-6 overflow-hidden">
                  <div className="shrink-0 w-14 h-14 rounded-full gradient-rose-gold flex items-center justify-center text-white font-heading text-xl font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-ui font-semibold text-burgundy">{user?.name}</h3>
                    <p className="font-body text-xs text-burgundy/40">{user?.email}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    // For the Overview/Home page, we highlight if pathname is exactly /dashboard
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                          isActive ? 'bg-champagne/80 shadow-sm' : 'hover:bg-champagne/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-burgundy' : 'text-burgundy/50'} />
                          <span className={`font-ui text-sm font-medium group-hover:text-burgundy ${
                            isActive ? 'text-burgundy font-bold' : 'text-burgundy/70'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight size={14} className={isActive ? 'text-burgundy/50' : 'text-burgundy/20'} />
                      </Link>
                    );
                  })}
                  <button
                    onClick={async () => {
                      try {
                        await logoutAction();
                      } catch (err) {
                        console.error('Logout action failed:', err);
                      }
                      document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      logout();
                      router.refresh();
                      router.push('/');
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left group mt-2"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span className="font-ui text-sm font-medium text-red-400 group-hover:text-red-500">Sign Out</span>
                  </button>
                </nav>
              </motion.div>
            </div>

            {/* Right: Dynamic Content Area */}
            <div className="lg:col-span-9 space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
