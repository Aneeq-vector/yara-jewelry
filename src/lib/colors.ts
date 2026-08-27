import { Product } from '@/types';

export interface NormalizedColor {
  name: string;
  normalizedName: string;
  hex?: string;
  stock?: number;
  isCustom: boolean;
}

const PRESET_COLORS_MAP: Record<string, string> = {
  'Gold': '#D4AF37',
  'Silver': '#C0C0C0',
  'Rose Gold': '#B76E79',
  'Platinum': '#E5E4E2',
  'Black': '#000000',
  'Yellow': '#FFD700',
  'Purple': '#800080',
  'Green': '#008000',
  'Pink': '#FFC0CB',
};

export function normalizeColorName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Returns a complete map of all configured colors for a product,
 * merging preset colors, custom colors, and their respective stock and hex values.
 */
export function getProductColors(product: Product): NormalizedColor[] {
  const result: NormalizedColor[] = [];
  
  // Preset colors defined in `colors` array
  if (product.colors && Array.isArray(product.colors)) {
    for (const colorName of product.colors) {
      const normalized = normalizeColorName(colorName);
      
      // If a color is also mistakenly in customColors, we'll let customColors override it later,
      // but usually they shouldn't overlap if Admin form prevents duplicates.
      result.push({
        name: colorName,
        normalizedName: normalized,
        hex: PRESET_COLORS_MAP[colorName] || undefined,
        stock: product.colorStock ? product.colorStock[colorName] : undefined,
        isCustom: false,
      });
    }
  }

  // Custom colors defined in `customColors` array
  if (product.customColors && Array.isArray(product.customColors)) {
    for (const custom of product.customColors) {
      const normalized = normalizeColorName(custom.name);
      
      // Prevent duplicates in the returned list (case-insensitive)
      const existingIdx = result.findIndex(c => c.normalizedName === normalized);
      
      const customItem = {
        name: custom.name,
        normalizedName: normalized,
        hex: custom.hex,
        stock: product.colorStock ? product.colorStock[custom.name] : undefined,
        isCustom: true,
      };
      
      if (existingIdx >= 0) {
        // Override with custom definition
        result[existingIdx] = customItem;
      } else {
        result.push(customItem);
      }
    }
  }

  return result;
}

/**
 * Validates whether a requested color is valid and has sufficient stock.
 */
export function validateColorStock(product: Product, requestedColor: string, requestedQuantity: number): { valid: boolean; error?: string; canonicalName?: string; currentStock?: number } {
  if (product.inventoryMode !== 'color') {
    if (requestedQuantity > (product.quantity || 0)) {
      return { valid: false, error: 'Insufficient global stock', currentStock: product.quantity };
    }
    return { valid: true, currentStock: product.quantity };
  }

  const colors = getProductColors(product);
  const normalizedRequested = normalizeColorName(requestedColor);
  
  const configuredColor = colors.find(c => c.normalizedName === normalizedRequested);
  
  if (!configuredColor) {
    return { valid: false, error: 'Selected color is not configured for this product' };
  }
  
  const availableStock = configuredColor.stock || 0;
  
  if (requestedQuantity > availableStock) {
    return { valid: false, error: `Insufficient stock for ${configuredColor.name}`, currentStock: availableStock };
  }
  
  return { valid: true, canonicalName: configuredColor.name, currentStock: availableStock };
}
