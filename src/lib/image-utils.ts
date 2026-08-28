import { ImageLoaderProps } from 'next/image';

export type ImagePreset = 'thumb' | 'card' | 'gallery' | 'full';

export function getOptimizedImageUrl(originalUrl: string, size: ImagePreset = 'full'): string {
  if (!originalUrl) return originalUrl;

  try {
    const url = new URL(originalUrl);
    
    // Only optimize absolute URLs targeting our PocketBase instance
    if (!url.pathname.includes('/api/files/') || url.hostname !== 'pb.yarasl.shop') {
      return originalUrl;
    }

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

export function pbLoader({ src, width }: ImageLoaderProps): string {
  if (!isPocketBaseResizable(src)) return src;

  try {
    const url = new URL(src);
    const isPng = url.pathname.toLowerCase().endsWith('.png');
    
    if (isPng && width > 1000) {
      url.searchParams.delete('thumb');
      return url.toString();
    }
    
    if (width > 1400) {
      // For very large displays, return the original master URL
      url.searchParams.delete('thumb');
      return url.toString();
    }

    const sizes = [250, 500, 700, 1000, 1400];
    const targetWidth = sizes.find(s => s >= width) || 1400;
    
    url.searchParams.set('thumb', `${targetWidth}x0`);
    return url.toString();
  } catch (e) {
    return src;
  }
}
