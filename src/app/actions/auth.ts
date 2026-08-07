'use server';

import { getServerClient, getAdminPanelClient, requireAuth, getServerSession, validateSession, getAdminClient } from '@/lib/pocketbase-server';
import { loginSchema, registerSchema } from '@/lib/schemas';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten().fieldErrors };
  }

  try {
    const pb = await getServerClient();
    const authData = await pb.collection('users').authWithPassword(parsed.data.email, parsed.data.password);
    
    if (authData.record.status === 'Inactive') {
      pb.authStore.clear();
      return { error: 'cannot login kindly contact customer support' };
    }
    
    const expectedRole = data.expectedRole || 'customer';
    if (authData.record.role !== expectedRole) {
      pb.authStore.clear();
      return { error: `Access denied. Please login via the correct portal.` };
    }
    
    const cookieStore = await cookies();
    const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
    
    const cookieName = authData.record.role === 'admin' ? 'pb_admin_auth' : 'pb_auth';
    const remember = data.remember === 'true';
    
    cookieStore.set(cookieName, authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(remember && { maxAge: 60 * 60 * 24 * 14 }), // 14 days if remember is true
    });
    
    // Ensure the record is a plain object without prototype methods for Server Actions
    const plainUser = structuredClone(authData.record);
    
    return { success: true, user: plainUser };
  } catch (error: any) {
    return { error: error.message || 'Failed to login' };
  }
}

export async function registerAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten().fieldErrors };
  }

  try {
    const pb = await getServerClient();
    // Default role is customer
    const record = await pb.collection('users').create({
      email: parsed.data.email,
      password: parsed.data.password,
      passwordConfirm: parsed.data.passwordConfirm,
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: 'customer',
      status: 'Active'
    });
    
    // Auto-login after registration
    await pb.collection('users').authWithPassword(parsed.data.email, parsed.data.password);
    
    // Explicitly set the cookie here to guarantee it gets saved
    const cookieStore = await cookies();
    const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
    
    cookieStore.set('pb_auth', authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { success: true, user: record };
  } catch (error: any) {
    return { error: error.message || 'Failed to register' };
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const adminPb = await getAdminClient();
    try {
      await adminPb.collection('users').getFirstListItem(`email="${email}"`);
    } catch (e) {
      return { error: 'The email is not registered. Kindly create an account.', notFound: true };
    }

    const pb = await getServerClient();
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to request password reset' };
  }
}

export async function logoutAction() {
  await getServerSession();
  const pb = await getServerClient();
  pb.authStore.clear();
  // We also explicitly remove the cookie as a fallback
  const cookieStore = await cookies();
  cookieStore.delete('pb_auth');
}

export async function adminLogoutAction() {
  await getServerSession();
  const pb = await getAdminPanelClient();
  pb.authStore.clear();
  const cookieStore = await cookies();
  cookieStore.delete('pb_admin_auth');
}

export async function getUserAction() {
  const { pb, user } = await getServerSession();
  if (!user) return null;

  try {
    // Fetch fresh user record from DB to avoid stale cookie data
    const freshRecord = await pb.collection('users').getOne(user.id);
    
    if (freshRecord.status === 'Inactive') {
      pb.authStore.clear();
      const cookieStore = await cookies();
      cookieStore.delete('pb_auth');
      return null;
    }
    
    // Update the cookie with the fresh record
    const cookieStore = await cookies();
    const authPayload = JSON.stringify({ token: pb.authStore.token, model: freshRecord });
    cookieStore.set('pb_auth', authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return structuredClone(freshRecord);
  } catch (err) {
    return null;
  }
}

export async function updateUserAction(id: string, updates: Record<string, any>) {
  try {
    const { pb, user } = await requireAuth();
    if (user.id !== id) {
      return { error: 'Unauthorized' };
    }
    const record = await pb.collection('users').update(id, updates);
    
    const cookieStore = await cookies();
    const authPayload = JSON.stringify({ token: pb.authStore.token, model: record });
    cookieStore.set('pb_auth', authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    const plainUser = structuredClone(record);
    return { success: true, user: plainUser };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}
export async function getAdminUsersAction() {
  try {
    const { pb } = await validateSession();
    const admins = await pb.collection('users').getFullList({
      filter: 'role = "admin"'
    });
    
    return { success: true, admins: structuredClone(admins) };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch admins' };
  }
}
