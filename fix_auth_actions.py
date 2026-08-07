with open('src/app/actions/auth.ts', 'r') as f:
    c = f.read()

target = """    const cookieName = authData.record.role === 'admin' ? 'pb_admin_auth' : 'pb_auth';
    cookieStore.set(cookieName, authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });"""

replacement = """    const cookieName = authData.record.role === 'admin' ? 'pb_admin_auth' : 'pb_auth';
    const remember = data.remember === 'true';
    
    cookieStore.set(cookieName, authPayload, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(remember && { maxAge: 60 * 60 * 24 * 14 }), // 14 days if remember is true
    });"""

c = c.replace(target, replacement)

target2 = "export async function logoutAction() {"
replacement2 = """export async function requestPasswordResetAction(email: string) {
  try {
    const pb = await getServerClient();
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to request password reset' };
  }
}

export async function logoutAction() {"""

c = c.replace(target2, replacement2)

with open('src/app/actions/auth.ts', 'w') as f:
    f.write(c)

