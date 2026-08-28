export type ImagePreset = 'thumb' | 'card' | 'gallery' | 'full';

export function getOptimizedImageUrl(originalUrl: string, size: ImagePreset = 'full'): string {
  if (!originalUrl) return originalUrl;

  try {
    const url = new URL(originalUrl);
    
    // Only optimize absolute URLs targeting our PocketBase instance
    if (!url.pathname.includes('/api/files/') || url.hostname !== 'pb.yarasl.shop') {
      return originalUrl;
    }

    // PocketBase standard binary (Go image lib) does not support AVIF thumbnails natively.
    // If we request a thumb for AVIF, it will just return the original file, so we skip adding the query.
    if (url.pathname.toLowerCase().endsWith('.avif') || size === 'full') {
      return originalUrl;
    }

    switch (size) {
      case 'thumb': 
        url.searchParams.set('thumb', '250x0'); 
        break;
      case 'card': 
        url.searchParams.set('thumb', '700x0'); 
        break;
      case 'gallery': 
        url.searchParams.set('thumb', '1400x0'); 
        break;
    }
    
    return url.toString();
  } catch (e) {
    return originalUrl;
  }
}

export function isPocketBaseResizable(originalUrl: string): boolean {
  if (!originalUrl) return false;
  
  try {
    const url = new URL(originalUrl);
    
    if (!url.pathname.includes('/api/files/') || url.hostname !== 'pb.yarasl.shop') {
      return false;
    }

    if (url.pathname.toLowerCase().endsWith('.avif')) {
      return false; // Cannot resize AVIF natively
    }

    return true;
  } catch (e) {
    return false;
  }
}
