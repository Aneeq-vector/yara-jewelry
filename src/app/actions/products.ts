'use server';

import { validateSession } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';
import { mapRecordToProduct } from '@/lib/data/products';

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
      filters.push(`inStock = true`);
    } else if (inStock === 'Out of Stock') {
      filters.push(`inStock = false`);
    }
    if (badge !== 'All') {
      filters.push(`badge = "${badge}"`);
    }
    
    const filterString = filters.length > 0 ? filters.join(' && ') : '';

    const records = await pb.collection('products').getList(page, perPage, {
      sort: sort,
      filter: filterString,
      expand: 'category',
      fields: 'id,collectionId,name,price,originalPrice,category,inStock,quantity,rating,reviewCount,productCode,images,imagePositions,description,shortDescription,badge,colors,tags,material,weight,expand.category.id,expand.category.name', // Optimized fields payload
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
  console.log('[PRODUCT_SAVE_DEBUG] ACTION_REACHED');
  try {
    const { pb } = await validateSession();
    
    // 1. STRICTLY VALIDATE inventoryMode
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
    let newFileCount = 0;
    let existingFileCount = 0;
    let totalSize = 0;
    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    
    for (const val of imagesFormValues) {
      if (val instanceof File) {
        newFileCount++;
        if (val.size > MAX_PRODUCT_IMAGE_SIZE) {
          return { success: false, error: `Image ${val.name} exceeds the 2MB limit.` };
        }
        if (!ALLOWED_MIME.has(val.type)) {
          return { success: false, error: `File ${val.name} has an invalid MIME type (${val.type}). Allowed: jpeg, png, webp, avif.` };
        }
        totalSize += val.size;
      } else if (typeof val === 'string') {
        existingFileCount++;
      }
    }
    
    if (newFileCount + existingFileCount > MAX_IMAGES) {
      return { success: false, error: `Cannot have more than ${MAX_IMAGES} final images.` };
    }
    if (totalSize > 16 * 1024 * 1024) {
      return { success: false, error: `Total new image upload size exceeds 16MB.` };
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
      sort: 'name',
      fields: 'id,collectionId,name,price,inStock,quantity,images,productCode,category,colors', // Minimal fields including quantity and colors
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
      filter: `category = "${categoryId}"`,
      fields: 'id,name,productCode,price,quantity,category',
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
      fields: 'id,name,productCode,price,quantity,category,expand.category.name,expand.category.id',
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
