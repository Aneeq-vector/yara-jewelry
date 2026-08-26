import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { PB_URL } from './pocketbase';

// Client for Server Components and Server Actions, bound to the user's cookie
export async function getServerClient() {
  const cookieStore = await cookies();
  const pb = new PocketBase(PB_URL);
  
  // Disable Next.js aggressive fetch caching
  pb.beforeSend = function (url, options) {
    options.cache = 'no-store';
    return { url, options };
  };
  
  // Load the auth store from the cookie if it exists
  let isRemembered = false;
  const pbAuthCookie = cookieStore.get('pb_auth');
  if (pbAuthCookie && pbAuthCookie.value) {
    try {
      let val = pbAuthCookie.value;
      if (val.includes('%7B')) val = decodeURIComponent(val);
      const parsed = JSON.parse(val);
      if (parsed.remember) isRemembered = true;
    } catch (e) {}
    pb.authStore.loadFromCookie(`pb_auth=${pbAuthCookie.value}`);
  }

  // Update the cookie whenever the auth store changes (e.g. login/logout)
  // Note: Setting cookies is only allowed in Server Actions or Route Handlers,
  // not in Server Components. If this throws in a Server Component, it's normal
  // if the auth store hasn't actually changed.
  pb.authStore.onChange(() => {
    try {
      const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record, remember: isRemembered });
      cookieStore.set('pb_auth', authPayload, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...(isRemembered && { maxAge: 60 * 60 * 24 * 14 }),
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
  
  pb.beforeSend = function (url, options) {
    options.cache = 'no-store';
    return { url, options };
  };
  
  let isRemembered = false;
  const pbAuthCookie = cookieStore.get('pb_admin_auth');
  if (pbAuthCookie && pbAuthCookie.value) {
    try {
      let val = pbAuthCookie.value;
      if (val.includes('%7B')) val = decodeURIComponent(val);
      const parsed = JSON.parse(val);
      if (parsed.remember) isRemembered = true;
    } catch (e) {}
    pb.authStore.loadFromCookie(`pb_admin_auth=${pbAuthCookie.value}`, 'pb_admin_auth');
  }

  pb.authStore.onChange(() => {
    try {
      const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record, remember: isRemembered });
      cookieStore.set('pb_admin_auth', authPayload, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...(isRemembered && { maxAge: 60 * 60 * 24 * 14 }),
      });
    } catch (e) {
      // Ignoring error if we are in a server component rendering phase
    }
  });

  return pb;
}

export async function requireAuth() {
  const pb = await getServerClient();
  if (!pb.authStore.isValid || !pb.authStore.record) {
    throw new Error('Unauthorized');
  }
  return { pb, user: pb.authStore.record };
}

// ─── Admin Client Cache ──────────────────────────────────────────────────────
// Caches the admin auth token in memory to avoid a full HTTP login on every
// single admin panel request. Tokens are refreshed 5 minutes before expiry.
let _adminClientCache: { pb: PocketBase; expiresAt: number } | null = null;

// Client for Admin-only operations using env credentials
export async function getAdminClient() {
  const now = Date.now();
  const CACHE_TTL_MS = 55 * 60 * 1000; // 55 minutes (tokens last 1 hour)

  // Return cached client if it's still valid
  if (_adminClientCache && now < _adminClientCache.expiresAt) {
    return _adminClientCache.pb;
  }

  const pb = new PocketBase(PB_URL);
  
  pb.beforeSend = function (url, options) {
    options.cache = 'no-store';
    return { url, options };
  };

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PocketBase admin credentials are not set in .env');
  }

  // Authenticate as superuser (PocketBase v0.23+ replaced pb.admins with _superusers collection)
  await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);

  _adminClientCache = { pb, expiresAt: now + CACHE_TTL_MS };

  return pb;
}

export async function getServerSession() {
  const cookieStore = await cookies();

  const pb = new PocketBase(PB_URL);
  
  pb.beforeSend = function (url, options) {
    options.cache = 'no-store';
    return { url, options };
  };

  let isRemembered = false;
  const pbAuthCookie = cookieStore.get('pb_auth');
  if (pbAuthCookie && pbAuthCookie.value) {
    try {
      let val = pbAuthCookie.value;
      if (val.includes('%7B')) val = decodeURIComponent(val);
      const parsed = JSON.parse(val);
      if (parsed.remember) isRemembered = true;
    } catch (e) {}
    pb.authStore.loadFromCookie(`pb_auth=${pbAuthCookie.value}`);
  }
  
  pb.authStore.onChange(() => {
    try {
      const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record, remember: isRemembered });
      cookieStore.set('pb_auth', authPayload, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...(isRemembered && { maxAge: 60 * 60 * 24 * 14 }),
      });
    } catch (e) {
      // Ignoring error if we are in a server component rendering phase
    }
  });
  
  const user = pb.authStore.isValid ? pb.authStore.record : null;
  
  return { pb, user };
}

export async function validateSession() {
  const pb = await getAdminPanelClient();
  if (!pb.authStore.isValid || !pb.authStore.record || pb.authStore.record.role !== 'admin') {
    throw new Error('Unauthorized Admin');
  }
  return { pb, user: pb.authStore.record };
}
