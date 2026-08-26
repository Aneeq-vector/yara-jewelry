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
