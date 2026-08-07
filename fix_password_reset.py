import re

with open('src/app/actions/auth.ts', 'r') as f:
    c = f.read()

target = """export async function requestPasswordResetAction(email: string) {
  try {
    const pb = await getServerClient();
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to request password reset' };
  }
}"""

replacement = """export async function requestPasswordResetAction(email: string) {
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
}"""

# ensure getAdminClient is imported
if "getAdminClient" not in c.split("export async function requestPasswordResetAction")[0]:
    c = c.replace("import { getServerClient, getAdminPanelClient, requireAuth, getServerSession, validateSession } from '@/lib/pocketbase-server';", 
                  "import { getServerClient, getAdminPanelClient, requireAuth, getServerSession, validateSession, getAdminClient } from '@/lib/pocketbase-server';")

c = c.replace(target, replacement)

with open('src/app/actions/auth.ts', 'w') as f:
    f.write(c)

