import imageCompression from 'browser-image-compression';
export async function compressImage(file: File, maxWidth = 1600, maxHeight = 1600): Promise<File> {
  // Do not compress non-images or PDFs
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If it's a very small image already (e.g. < 200KB), skip compression
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return resolve(file);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use original file type, default to 0.8 quality
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = mimeType === 'image/jpeg' ? 0.8 : undefined;
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (blob) {
          // If the "compressed" blob is somehow larger, return the original file
          if (blob.size >= file.size) {
            resolve(file);
          } else {
            const compressedFile = new File([blob], file.name, { type: mimeType, lastModified: Date.now() });
            resolve(compressedFile);
          }
        } else {
          resolve(file);
        }
      }, mimeType, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback to original file if loading fails
    };
    
    img.src = objectUrl;
  });
}


let transparencyQueue = Promise.resolve(false);

export async function hasTransparency(file: File): Promise<boolean> {
  const check = async () => {
    try {
      if (typeof createImageBitmap !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
        const bmp = await createImageBitmap(file);
        try {
          const canvas = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.clearRect(0, 0, bmp.width, bmp.height);
            ctx.drawImage(bmp, 0, 0);
            const imageData = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
            for (let i = 3; i < imageData.length; i += 4) {
              if (imageData[i] < 255) return true;
            }
            return false;
          }
        } finally {
          if (bmp.close) bmp.close();
        }
      }
    } catch (e) {
      console.error("OffscreenCanvas/createImageBitmap failed, falling back to main thread", e);
    }

    return new Promise<boolean>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return resolve(true);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let isTransparent = false;
        for (let i = 3; i < imageData.length; i += 4) {
          if (imageData[i] < 255) {
            isTransparent = true;
            break;
          }
        }
        
        URL.revokeObjectURL(objectUrl);
        resolve(isTransparent);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true); 
      };
      img.src = objectUrl;
    });
  };

  return new Promise((resolve) => {
    transparencyQueue = transparencyQueue.then(async () => {
      const result = await check().catch(() => true);
      resolve(result);
      return result;
    });
  });
}

export async function getImageDimensions(file: File): Promise<{ width: number, height: number }> {
   return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
         resolve({ width: img.width, height: img.height });
         URL.revokeObjectURL(url);
      };
      img.onerror = () => {
         URL.revokeObjectURL(url);
         reject(new Error("Failed to load image"));
      };
      img.src = url;
   });
}

export async function prepareCommerceImage(file: File): Promise<{ file: File, converted: boolean, originalType: string }> {
   try {
      const { width, height } = await getImageDimensions(file);
      const isSmallEnough = file.size < 650 * 1024;
      const isWithinDimensions = width <= 1920 && height <= 1920;
      
      let targetOptions: any = {
         maxSizeMB: 1.5,
         maxWidthOrHeight: 1920,
         useWebWorker: true,
      };
      
      const isPng = file.type === 'image/png';
      let shouldConvertPNG = false;
      let newName = file.name;
      
      if (isPng) {
         const hasAlpha = await hasTransparency(file);
         if (!hasAlpha) {
            shouldConvertPNG = true;
         } else if (isSmallEnough && isWithinDimensions) {
            return { file, converted: false, originalType: file.type };
         }
      } else {
         const isOptimizedType = ['image/webp', 'image/avif', 'image/jpeg'].includes(file.type);
         if (isOptimizedType && isSmallEnough && isWithinDimensions) {
            return { file, converted: false, originalType: file.type };
         }
      }
      
      if (shouldConvertPNG) {
         targetOptions.fileType = 'image/jpeg';
         targetOptions.initialQuality = 0.92;
         const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
         newName = `${baseName}.jpg`;
      }
      
      const compressed = await imageCompression(file, targetOptions);
      
      const finalName = targetOptions.fileType === 'image/jpeg' ? newName : (compressed.name || file.name);
      const finalType = targetOptions.fileType === 'image/jpeg' ? 'image/jpeg' : compressed.type;
      
      const finalFile = new File([compressed], finalName, {
         type: finalType,
         lastModified: file.lastModified
      });
      
      return { file: finalFile, converted: shouldConvertPNG, originalType: file.type };
   } catch (e) {
      console.error("prepareCommerceImage failed", e);
      throw new Error(`Could not prepare image "${file.name}". Please try another image.`);
   }
}
