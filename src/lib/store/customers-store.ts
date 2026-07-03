'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: string;
  joined: string;
  status: 'Active' | 'Inactive' | 'VIP';
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Emma Thompson', email: 'emma.t@example.com', orders: 12, spent: 'Rs. 450,000', joined: 'Jan 15, 2026', status: 'Active' },
  { id: 'CUST-002', name: 'James Wilson', email: 'j.wilson@example.com', orders: 3, spent: 'Rs. 185,000', joined: 'Feb 28, 2026', status: 'Active' },
  { id: 'CUST-003', name: 'Sarah Davis', email: 'sarah.d@example.com', orders: 1, spent: 'Rs. 12,500', joined: 'Mar 10, 2026', status: 'Inactive' },
  { id: 'CUST-004', name: 'Michael Brown', email: 'mbrown99@example.com', orders: 5, spent: 'Rs. 240,000', joined: 'Apr 02, 2026', status: 'Active' },
  { id: 'CUST-005', name: 'Emily Chen', email: 'emily.chen@example.com', orders: 8, spent: 'Rs. 520,000', joined: 'May 14, 2026', status: 'VIP' },
];

interface CustomersStore {
  customers: Customer[];
  deleteCustomer: (id: string) => void;
  updateCustomerStatus: (id: string, status: Customer['status']) => void;
}

export const useCustomersStore = create<CustomersStore>()(
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
      name: 'yara-customers',
    }
  )
);
