import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { PB_URL } from './pocketbase';

// Client for Server Components and Server Actions, bound to the user's cookie
export async function getServerClient() {
  const cookieStore = await cookies();
  const pb = new PocketBase(PB_URL);
  
  // Load the auth store from the cookie if it exists
  const pbAuthCookie = cookieStore.get('pb_auth');
  if (pbAuthCookie && pbAuthCookie.value) {
    pb.authStore.loadFromCookie(`pb_auth=${pbAuthCookie.value}`);
  }

  // Update the cookie whenever the auth store changes (e.g. login/logout)
  // Note: Setting cookies is only allowed in Server Actions or Route Handlers,
  // not in Server Components. If this throws in a Server Component, it's normal
  // if the auth store hasn't actually changed.
  pb.authStore.onChange(() => {
    try {
      const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
      cookieStore.set('pb_auth', authPayload, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (e) {
      // Ignoring error if we are in a server component rendering phase
    }
  });

  return pb;
}

// Client for Admin Panel users, bound to the admin's cookie
export async function getAdminPanelClient() {
  const cookieStore = await cookies();
  const pb = new PocketBase(PB_URL);
  
  const pbAuthCookie = cookieStore.get('pb_admin_auth');
  if (pbAuthCookie && pbAuthCookie.value) {
    pb.authStore.loadFromCookie(`pb_admin_auth=${pbAuthCookie.value}`);
  }

  pb.authStore.onChange(() => {
    try {
      const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
      cookieStore.set('pb_admin_auth', authPayload, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (e) {
      // Ignoring error if we are in a server component rendering phase
    }
  });

  return pb;
}

// Client for Admin-only operations using env credentials
export async function getAdminClient() {
  const pb = new PocketBase(PB_URL);
  
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PocketBase admin credentials are not set in .env');
  }

  // Authenticate as admin
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  return pb;
}
