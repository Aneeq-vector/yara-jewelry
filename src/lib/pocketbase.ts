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

export function createRealtimeClient() {
  // Always use the absolute URL to bypass Next.js rewrites for SSE.
  // Next.js rewrites often buffer chunked responses, delaying or blocking PB_CONNECT.
  const absoluteUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop';
  const pb = new PocketBase(absoluteUrl);
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

export function getReceiptUrl(order: any): string | null {
  if (!order || !order.receipt) return null;
  const collectionIdOrName = order.collectionId || order.collectionName || 'orders';
  return `${PB_URL}/api/files/${collectionIdOrName}/${order.id}/${order.receipt}`;
}
