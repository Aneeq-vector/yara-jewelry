'use server';

import { getServerClient } from '@/lib/pocketbase-server';
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
    
    // Explicitly set the cookie here to guarantee it gets saved
    const cookieStore = await cookies();
    const authPayload = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.record });
    
    cookieStore.set('pb_auth', authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    // Ensure the record is a plain object without prototype methods for Server Actions
    const plainUser = JSON.parse(JSON.stringify(authData.record));
    
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

export async function logoutAction() {
  const pb = await getServerClient();
  pb.authStore.clear();
  // We also explicitly remove the cookie as a fallback
  const cookieStore = await cookies();
  cookieStore.delete('pb_auth');
}

export async function getUserAction() {
  const pb = await getServerClient();
  if (!pb.authStore.isValid || !pb.authStore.record) return null;

  try {
    // Fetch fresh user record from DB to avoid stale cookie data
    const freshRecord = await pb.collection('users').getOne(pb.authStore.record.id);
    
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
    
    return JSON.parse(JSON.stringify(freshRecord));
  } catch (err) {
    return null;
  }
}

export async function updateUserAction(id: string, updates: Record<string, any>) {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || pb.authStore.record?.id !== id) {
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
    
    const plainUser = JSON.parse(JSON.stringify(record));
    return { success: true, user: plainUser };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}
export async function getAdminUsersAction() {
  try {
    const pb = await getServerClient();
    if (!pb.authStore.isValid || pb.authStore.record?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }
    const admins = await pb.collection('users').getFullList({
      filter: 'role = "admin"'
    });
    
    return { success: true, admins: JSON.parse(JSON.stringify(admins)) };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch admins' };
  }
}
