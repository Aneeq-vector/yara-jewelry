import PocketBase from 'pocketbase';


export const PB_URL = typeof window !== 'undefined' 
  ? '/pb'
  : (process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop');

export function createClient() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const pbAuthCookie = cookies.find(c => c.trim().startsWith('pb_auth='));
    if (pbAuthCookie) {
      pb.authStore.loadFromCookie(pbAuthCookie.trim());
    }
  }
  
  return pb;
}

// Client for Server Components and Server Actions has been moved to pocketbase-server.ts
