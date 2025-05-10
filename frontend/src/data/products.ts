
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
  price: number;
  image: string;
  /**
   * Additional product images
   */
  images?: string[];
  /**
   * Product video URL
   */
  video?: string;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  origin: string;
  weight: string;
  inStock: boolean;
  salePrice?: number;
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
