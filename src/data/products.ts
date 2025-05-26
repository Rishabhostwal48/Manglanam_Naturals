export interface ProductSize {
  size: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
}

export interface Product {
  /**
   * Primary ID field - should be a string, but may come as an object from MongoDB
   * Always normalize this to a string before using in components
   */
  _id: string | any;
  
  /**
   * Legacy ID field - kept for backward compatibility
   * May be used as fallback if _id is invalid
   */
  id?: string;
  
  /**
   * URL-friendly identifier for the product

   */
  slug?: string;
  
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  hasMultipleSizes: boolean;
  basePrice?: number;
  baseSalePrice?: number;
  sizes?: ProductSize[];
  price?: number; // For backward compatibility
  salePrice?: number; // For backward compatibility
  image: string;
  images?: string[];
  video?: string;
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  origin: string;
  tags?: string[];
  rating: number;
  reviewCount: number;
  weight?: string; // For backward compatibility
}

export const categories = [
  { id: "whole-spices", name: "Whole Spices" },
  { id: "ground-spices", name: "Ground Spices" },
  { id: "blends", name: "Spice Blends" },
  { id: "herbs", name: "Dried Herbs" },
  { id: "exotic", name: "Exotic Spices" },
];

// Products will be fetched from the API
export const products: Product[] = [];

// These functions will be replaced by API calls in the actual implementation
export function getProductById(id: string | any): Product | undefined {
  // In the real implementation, this would make an API call
  return undefined;
}

export function getFeaturedProducts(): Product[] {
  // In the real implementation, this would make an API call
  return [];
}

export function getBestSellers(): Product[] {
  // In the real implementation, this would make an API call
  return [];
}

export function getProductsByCategory(categoryId: string): Product[] {
  // In the real implementation, this would make an API call
  return [];
}

export function searchProducts(query: string): Product[] {
  // In the real implementation, this would make an API call
  return [];
}
