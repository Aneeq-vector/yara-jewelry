'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  Settings, 
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { useAdminAuthStore } from '@/lib/store/admin-auth-store';
import { adminLogoutAction } from '@/app/actions/auth';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', href: '/yara-admin', icon: LayoutDashboard },
  { name: 'Products', href: '/yara-admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/yara-admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/yara-admin/customers', icon: Users },
  { name: 'Settings', href: '/yara-admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAdminAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasHydrated(useAdminAuthStore.persist.hasHydrated());
    
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (isClient && hasHydrated) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/auth/login');
      }
    }
  }, [isClient, hasHydrated, isAuthenticated, user, router]);

  // Prevent hydration mismatch or showing admin UI briefly before redirect
  if (!isClient || !hasHydrated || !isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await adminLogoutAction();
    } catch (err) {
      console.error('Logout action failed:', err);
    }
    logout();
    router.refresh();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-burgundy/10 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/yara-admin" className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold text-burgundy">Yara Admin</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-burgundy/50 hover:text-burgundy">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-burgundy text-white font-medium shadow-md shadow-burgundy/20' 
                    : 'text-burgundy/70 hover:bg-rose-gold/10 hover:text-burgundy'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-ui">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-burgundy/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-burgundy/70 hover:bg-rose-gold/10 hover:text-burgundy transition-colors text-sm font-ui"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-burgundy/10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-burgundy p-2 rounded-lg hover:bg-rose-gold/10"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-burgundy/60 hover:text-burgundy transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-rose-gold/30 flex items-center justify-center text-burgundy font-bold text-sm">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-burgundy">Admin User</p>
                <p className="text-xs text-burgundy/60">Superadmin</p>
              </div>
              <ChevronDown size={14} className="text-burgundy/60" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
