import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/pocketbase-server';
import AdminLayoutClient from './AdminLayoutClient';
import AdminRealtimeProvider from '@/lib/providers/admin-realtime-provider';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Extract token securely on the server
  let token: string | null = null;
  
  try {
    const { pb } = await validateSession();
    // Validate session ensures this is a users collection token with role='admin'.
    // We pass it to the client safely.
    if (pb.authStore.isValid && pb.authStore.token) {
      token = pb.authStore.token;
    }
  } catch (error) {
    // If validation fails, token remains null. AdminLayoutClient will handle
    // the redirect via Zustand, or we can just let it pass null and the login
    // page will render (AdminLayoutClient bypasses wrapper for /login).
  }

  // Pass token to memory-only Realtime Provider, which wraps the actual Admin UI
  return (
    <AdminRealtimeProvider authToken={token}>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AdminRealtimeProvider>
  );
}
