'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AdminAuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Lamaa',
  email: 'lamaa@example.com',
  phone: '+94 7700 1111',
};

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password?: string) => {
        // Mock login — always succeeds
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const isAdmin = email === 'admin@yara.com';
        const role = isAdmin ? 'admin' : 'user';
        const name = isAdmin ? 'Admin User' : 'Lamaa';
        
        set({
          user: { ...MOCK_USER, email, name, role },
          isAuthenticated: true,
        });
        return true;
      },
      signup: async (name: string, email: string, phone: string) => {
        // Mock signup — always succeeds
        await new Promise((resolve) => setTimeout(resolve, 1200));
        set({
          user: { id: 'user-new', name, email, phone },
          isAuthenticated: true,
        });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'yara-admin-auth',
    }
  )
);
