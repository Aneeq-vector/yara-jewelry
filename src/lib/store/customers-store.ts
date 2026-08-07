'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  spent: string;
  joined: string;
  status: 'Active' | 'Inactive' | 'VIP';
  addresses?: any[];
}

const INITIAL_CUSTOMERS: Customer[] = [];

interface CustomersStore {
  customers: Customer[];
  deleteCustomer: (id: string) => void;
  updateCustomerStatus: (id: string, status: Customer['status']) => void;
}

const useCustomersStore = create<CustomersStore>()(
  persist(
    (set) => ({
      customers: INITIAL_CUSTOMERS,
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== id)
      })),
      updateCustomerStatus: (id, status) => set((state) => ({
        customers: state.customers.map((c) => 
          c.id === id ? { ...c, status } : c
        )
      })),
    }),
    {
      name: 'yara-customers-v2',
      version: 1, // Bump version to clear old mock data from localStorage
    }
  )
);
