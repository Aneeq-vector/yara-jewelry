'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import SearchModal from './SearchModal';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
