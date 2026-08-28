'use server';

import { validateSession } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';
import { mapRecordToProduct } from '@/lib/data/products';
import { after } from 'next/server';
import { PB_URL } from '@/lib/pocketbase';

// Safe serializer: converts PocketBase RecordModel → plain JSON
function toPlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Revalidate public-facing pages that display products.
// Admin pages prefetch server-side so they don't need cache invalidation.
function revalidateAll() {
  revalidatePath('/shop', 'page');
  revalidatePath('/shop/[id]', 'page');
  revalidatePath('/', 'page'); // home page (trending products etc)
}

export async function getProductsAction(page = 1, perPage = 50, search = '', categoryId = '', sort = '-id', inStock = 'All', badge = 'All') {
  try {
    const { pb } = await validateSession();
    
    // Build filter string
    const filters: string[] = [];
    if (search) {
      filters.push(`(name ~ "${search}" || productCode ~ "${search}")`);
    }
    if (categoryId) {
      filters.push(`category = "${categoryId}"`);
    }
    if (inStock === 'In Stock') {
      filters.push(`quantity > 0`);
    } else if (inStock === 'Out of Stock') {
      filters.push(`quantity = 0`);
    }
    if (badge !== 'All') {
      filters.push(`badge = "${badge}"`);
    }
    
    // Admin query: DO NOT filter out isStaged or isHidden
    const filterString = filters.length > 0 ? filters.join(' && ') : '';

    const records = await pb.collection('products').getList(page, perPage, {
      sort: sort,
      filter: filterString,
      expand: 'category',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,description,shortDescription,badge,colors,customColors,inventoryMode,colorStock,tags,material,weight,isHidden,isStaged,publishedAt,hasBeenPublished,expand.category.id,expand.category.name',
    });
    return { success: true, products: toPlain(records.items), totalItems: records.totalItems, totalPages: records.totalPages };
  } catch (error: any) {
    console.error('getProductsAction error:', error.message);
    return { success: false, error: error.message || 'Failed to fetch products' };
  }
}

export async function getCategoriesAction() {
  try {
    const { pb } = await validateSession();
    const records = await pb.collection('categories').getFullList({ sort: 'name' });
    return { success: true, categories: toPlain(records) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch categories' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const { pb } = await validateSession();
    await pb.collection('products').delete(id);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

export async function deleteProductsAction(ids: string[]) {
  try {
    const { pb } = await validateSession();
    await Promise.all(
      ids.map(id => pb.collection('products').delete(id).catch(e => console.error(`Delete ${id} failed:`, e)))
    );
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete products' };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    const { pb } = await validateSession();
    const original = await pb.collection('products').getOne(id);
    const newData: any = { ...toPlain(original) };
    delete newData.id;
    delete newData.created;
    delete newData.updated;
    delete newData.images;
    delete newData.collectionId;
    delete newData.collectionName;
    newData.name = `${newData.name} (Copy)`;
    const record = await pb.collection('products').create(newData);
    revalidateAll();
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to duplicate product' };
  }
}


const MAX_PRODUCT_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB per image
const MAX_IMAGES = 10;

export async function saveProductAction(formData: FormData, id?: string) {
  try {
    const { pb } = await validateSession();
    
    // 1. STRICTLY VALIDATE inventoryMode
    
    if (formData.has('isStaged')) { formData.set('isStaged', formData.get('isStaged') as string); }
    
    // VISIBILITY LOGIC
    if (formData.has('isHidden')) {
       // Explicitly supplied (e.g. from Add Product or Edit Product forms)
       formData.set('isHidden', formData.get('isHidden') === 'true' ? 'true' : 'false');
    } else if (!id) {
       // ADD PRODUCT default
       formData.set('isHidden', 'true');
    }

    const inventoryMode = formData.get('inventoryMode');
    if (inventoryMode !== 'global' && inventoryMode !== 'color') {
      return { success: false, error: 'inventoryMode must be exactly "global" or "color".' };
    }

    // 2 & 3. VALIDATE customColors SHAPE
    const customColorsStr = formData.get('customColors') as string;
    let customColors: any[] = [];
    if (customColorsStr) {
      try {
        customColors = JSON.parse(customColorsStr);
      } catch (e) {
        return { success: false, error: "Invalid custom color data." };
      }
    }
    
    if (!Array.isArray(customColors)) {
      return { success: false, error: "customColors must be an array." };
    }
    
    const canonicalCustomColors = [];
    for (const cc of customColors) {
      if (typeof cc !== 'object' || Array.isArray(cc) || !cc) {
        return { success: false, error: "customColors entries must be objects." };
      }
      if (typeof cc.name !== 'string' || !cc.name.trim() || cc.name.trim().length > 50) {
        return { success: false, error: "customColor name must be a non-empty string under 50 characters." };
      }
      if (typeof cc.hex !== 'string' || !/^#[0-9A-Fa-f]{6}$/i.test(cc.hex)) {
        return { success: false, error: `Invalid HEX code for color ${cc.name}.` };
      }
      canonicalCustomColors.push({
        name: cc.name.trim(),
        hex: cc.hex.toUpperCase()
      });
    }

    // 4. VALIDATE PRESET COLORS
    const ALLOWED_PRESETS = new Set([
      'Gold', 'Silver', 'Rose Gold', 'Platinum', 'Black', 'Yellow', 'Purple', 'Green', 'Pink'
    ]);
    const presetColors = formData.getAll('colors');
    for (const pc of presetColors) {
      if (typeof pc !== 'string' || !ALLOWED_PRESETS.has(pc)) {
        return { success: false, error: `Invalid preset color: ${pc}` };
      }
    }

    // Check custom colors count + presets
    if (presetColors.length + canonicalCustomColors.length > 10) {
      return { success: false, error: 'Cannot have more than 10 colors total.' };
    }

    const uniqueNames = new Set([...presetColors, ...canonicalCustomColors.map(c => c.name)].map(n => String(n).trim().toLowerCase()));
    if (uniqueNames.size < presetColors.length + canonicalCustomColors.length) {
      return { success: false, error: 'Color names must be unique (case-insensitive).' };
    }

    // 9 & 10. IMAGE VALIDATION & COUNT
    const imagesFormValues = formData.getAll('images');
    let existingFileCount = 0;
    for (const val of imagesFormValues) {
      if (typeof val === 'string') {
        existingFileCount++;
      } else if (val instanceof File) {
        return { success: false, error: 'saveProductAction does not accept new image files. Use batched uploads.' };
      }
    }
    if (existingFileCount > MAX_IMAGES) {
      return { success: false, error: `Cannot have more than ${MAX_IMAGES} final images.` };
    }
    
    // 5. VALIDATE colorStock keys match configuredColors EXACTLY
    const colorStockStr = formData.get('colorStock') as string;
    let colorStock: Record<string, number> = {};
    if (colorStockStr) {
      try {
        colorStock = JSON.parse(colorStockStr);
      } catch (e) {
        return { success: false, error: "Invalid color stock data." };
      }
    }

    const configuredColors = new Set([...presetColors as string[], ...canonicalCustomColors.map(c => c.name)]);
    
    if (inventoryMode === 'color') {
      const canonicalColorStock: Record<string, number> = {};
      let finalQty = 0;
      
      // Check for unknown keys
      for (const key of Object.keys(colorStock)) {
        if (!configuredColors.has(key)) {
          return { success: false, error: `colorStock contains unknown color: ${key}` };
        }
      }
      
      // Ensure every configured color gets an authoritative stock entry (default 0)
      for (const colorName of configuredColors) {
         const stock = Number(colorStock[colorName]);
         if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
           return { success: false, error: 'Color stock must be a non-negative integer.' };
         }
         canonicalColorStock[colorName] = stock;
         finalQty += stock;
      }
      
      // 6. SERVER-DERIVE COLOR TOTAL
      formData.set('quantity', finalQty.toString());
      formData.set('inStock', finalQty > 0 ? 'true' : 'false');
      formData.set('colorStock', JSON.stringify(canonicalColorStock));
      
      // 8. FIRST GLOBAL -> COLOR CONVERSION
      // (Equality requirement removed: admin is permitted to update inventory while converting modes)
    } else {
      // 7. GLOBAL MODE AUTHORITATIVE
      const submittedQty = Number(formData.get('quantity'));
      if (isNaN(submittedQty) || submittedQty < 0 || !Number.isInteger(submittedQty)) {
        return { success: false, error: 'Global quantity must be a non-negative integer.' };
      }
      formData.set('quantity', submittedQty.toString());
      formData.set('inStock', submittedQty > 0 ? 'true' : 'false');
      formData.set('colorStock', JSON.stringify({}));
    }
    
    formData.set('customColors', JSON.stringify(canonicalCustomColors));

    let record;
    if (id) {
      record = await pb.collection('products').update(id, formData);
    } else {
      record = await pb.collection('products').create(formData);
    }
    
    // 14. PRODUCT SAVE PERFORMANCE - Background invalidation
    revalidateProductsAction().catch(console.error);
    
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    console.error('saveProductAction error:', error.message);
    return { success: false, error: error.message || 'Failed to save product' };
  }
}


export async function revalidateProductsAction() {
  revalidateAll();
}



export async function getProductOptionsAction() {
  try {
    const { pb } = await validateSession();
    const records = await pb.collection('products').getFullList({
      sort: 'name', filter: 'isStaged = false && isHidden = false',
      fields: 'id,collectionId,name,price,inStock,quantity,images,productCode,category,colors,isHidden,isStaged,publishedAt,hasBeenPublished',
    });
    return { success: true, products: toPlain(records.map(mapRecordToProduct)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch product options' };
  }
}

export async function getCategoryProductsAction(categoryId: string, page = 1, perPage = 50) {
  try {
    const { pb } = await validateSession();
    // Lightweight query for the edit category modal
    const records = await pb.collection('products').getList(page, perPage, {
      filter: `category = "${categoryId}" && isStaged = false && isHidden = false`,
      fields: 'id,name,productCode,price,quantity,category,isHidden,isStaged,publishedAt,hasBeenPublished',
    });
    return { 
      success: true, 
      products: toPlain(records.items),
      page: records.page,
      perPage: records.perPage,
      totalItems: records.totalItems,
      totalPages: records.totalPages
    };
  } catch (error: any) {
    console.error('getCategoryProductsAction error:', error.message);
    return { success: false, error: error.message || 'Failed to fetch category products' };
  }
}

export async function getAssignableProductsAction(currentCategoryId: string, page = 1, perPage = 50, search = '') {
  try {
    const { pb } = await validateSession();
    
    let filterString = '';
    if (search) {
      filterString = `(name ~ "${search}" || productCode ~ "${search}")`;
    }

    const records = await pb.collection('products').getList(page, perPage, {
      filter: filterString,
      expand: 'category',
      fields: 'id,name,productCode,price,quantity,category,isHidden,isStaged,publishedAt,hasBeenPublished,expand.category.name,expand.category.id',
    });
    
    return { 
      success: true, 
      products: toPlain(records.items),
      page: records.page,
      perPage: records.perPage,
      totalItems: records.totalItems,
      totalPages: records.totalPages
    };
  } catch (error: any) {
    console.error('getAssignableProductsAction error:', error.message);
    return { success: false, error: error.message || 'Failed to fetch assignable products' };
  }
}


export async function uploadProductImageBatchAction(productId: string, formData: FormData) {
  try {
    const { pb } = await validateSession();
    
    // Fetch current to append safely and retain existing
    const currentProduct = await pb.collection('products').getOne(productId);
    const existingImages = currentProduct.images || [];
    
    const newFiles = formData.getAll('images');
    let totalSize = 0;
    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    
    if (existingImages.length + newFiles.length > MAX_IMAGES) {
       return { success: false, error: `Cannot exceed ${MAX_IMAGES} total images.` };
    }
    
    for (const val of newFiles) {
      if (!(val instanceof File)) {
        return { success: false, error: 'Batch must contain only File objects.' };
      }
      if (val.size > MAX_PRODUCT_IMAGE_SIZE) {
        return { success: false, error: `Image ${val.name} exceeds the 2MB limit.` };
      }
      if (!ALLOWED_MIME.has(val.type)) {
        return { success: false, error: `Invalid MIME type (${val.type}).` };
      }
      totalSize += val.size;
    }
    
    if (totalSize > 3.5 * 1024 * 1024) {
      return { success: false, error: 'Batch payload exceeds 3.5MB safety limit.' };
    }
    
    const updateFd = new FormData();
    for (const file of newFiles) {
      updateFd.append('images+', file);
    }
    
    const record = await pb.collection('products').update(productId, updateFd);
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    console.error('uploadProductImageBatchAction error:', error.message);
    return { success: false, error: error.message || 'Failed to upload image batch' };
  }
}

export async function finalizeProductImagesAction(productId: string, finalImages: string[], finalPositions: string[]) {
  try {
    const { pb } = await validateSession();
    
    const currentProduct = await pb.collection('products').getOne(productId);
    const currentImages = new Set(currentProduct.images || []);
    
    if (finalImages.length > MAX_IMAGES) {
      return { success: false, error: `Cannot exceed ${MAX_IMAGES} final images.` };
    }
    
    if (finalImages.length !== finalPositions.length) {
      return { success: false, error: 'Image count must match positions count.' };
    }
    
    const uniqueFinal = new Set(finalImages);
    if (uniqueFinal.size !== finalImages.length) {
      return { success: false, error: 'Duplicate filenames detected in finalization.' };
    }
    
    for (const img of finalImages) {
      if (!currentImages.has(img)) {
         return { success: false, error: `Unknown or unowned filename: ${img}` };
      }
    }
    
    if (finalImages.length > 0) {
      const heroImg = finalImages[0];
      const ext = heroImg.split('.').pop()?.toLowerCase();
      
      // Warm primary hero sizes if supported
      if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        const heroUrl = `${PB_URL}/api/files/${currentProduct.collectionId}/${productId}/${heroImg}`;
        
        // Mandatory warm - throws if fails
        const warmTasks = [
          warmImage(`${heroUrl}?thumb=700x0`),
          warmImage(`${heroUrl}?thumb=1000x0`)
        ];
        
        if (ext !== 'png') {
          warmTasks.push(warmImage(`${heroUrl}?thumb=1400x0`));
        }
        
        await Promise.all(warmTasks);
        
        // Background warm other sizes
        const collectionId = currentProduct.collectionId;
        const remainingImages = finalImages.slice(1);
        after(async () => {
          await Promise.allSettled([
            fetch(`${heroUrl}?thumb=250x0`, { cache: 'no-store' }),
            fetch(`${heroUrl}?thumb=500x0`, { cache: 'no-store' }),
            ...remainingImages.map(img => 
              fetch(`${PB_URL}/api/files/${collectionId}/${productId}/${img}?thumb=250x0`, { cache: 'no-store' })
            ),
            ...remainingImages.map(img => 
              fetch(`${PB_URL}/api/files/${collectionId}/${productId}/${img}?thumb=700x0`, { cache: 'no-store' })
            )
          ]);
        });
      }
    }

    const record = await pb.collection('products').update(productId, {
      images: finalImages,
      imagePositions: finalPositions,
      inStock: currentProduct.quantity > 0,
      isStaged: false
    });
    
    revalidateAll();
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    console.error('finalizeProductImagesAction error:', error.message);
    return { success: false, error: error.message || 'Failed to finalize product images' };
  }
}

export async function rollbackNewProductAction(productId: string) {
  try {
    const { pb } = await validateSession();
    await pb.collection('products').delete(productId);
    return { success: true };
  } catch (error: any) {
    console.error('rollbackNewProductAction error:', error.message);
    return { success: false, error: error.message || 'Failed to rollback product' };
  }
}

async function warmImage(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to warm image derivative (${response.status})`);
  }
}

export async function setProductVisibilityAction(productId: string, isHidden: boolean) {
  try {
    const { pb, user } = await validateSession();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }
    
    const currentProduct = await pb.collection('products').getOne(productId);
    
    const updateData: any = { isHidden };
    
    if (currentProduct.isHidden === true && isHidden === false && currentProduct.hasBeenPublished !== true) {
      updateData.publishedAt = new Date().toISOString();
      updateData.hasBeenPublished = true;
    }
    
    // Patch ONLY the isHidden field (and publishedAt if applicable)
    const record = await pb.collection('products').update(productId, updateData);
    
    revalidateProductsAction().catch(console.error);
    
    return { success: true, product: toPlain(record) };
  } catch (error: any) {
    console.error('setProductVisibilityAction error:', error.message);
    return { success: false, error: error.message || 'Failed to update visibility' };
  }
}
