
export interface Product {
  _id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  origin: string;
  weight: string;
  inStock: boolean;
  salePrice?: number; // Added optional salePrice property
}

export const categories = [
  { id: "whole-spices", name: "Whole Spices" },
  { id: "ground-spices", name: "Ground Spices" },
  { id: "blends", name: "Spice Blends" },
  { id: "herbs", name: "Dried Herbs" },
  { id: "exotic", name: "Exotic Spices" },
];

export const products: Product[] = [
  {
    _id: "001",
    id: "001",
    name: "Premium Kashmiri Saffron",
    category: "exotic",
    price: 24.99,
    image: "/placeholder.svg",
    description: "Our premium grade Kashmiri Saffron offers an exquisite aroma and flavor. Hand-harvested from the valleys of Kashmir, these delicate threads transform ordinary dishes into extraordinary culinary experiences.",
    featured: true,
    bestSeller: true,
    origin: "Kashmir, India",
    weight: "1g",
    inStock: true,
  },
  {
    _id: "002",
    id: "002",
    name: "Organic Turmeric Powder",
    category: "ground-spices",
    price: 9.99,
    image: "/placeholder.svg",
    description: "Certified organic turmeric with high curcumin content. Our turmeric powder adds vibrant color and warm, earthy flavor to curries, soups, and rice dishes.",
    featured: true,
    bestSeller: false,
    origin: "Kerala, India",
    weight: "100g",
    inStock: true,
  },
  {
    _id: "003",
    id: "003",
    name: "Black Cardamom Pods",
    category: "whole-spices",
    price: 12.99,
    image: "/placeholder.svg",
    description: "Smoky and aromatic black cardamom pods, perfect for rich curries, stews, and biryani. These large pods offer a distinct camphor-like flavor that adds depth to any dish.",
    featured: false,
    bestSeller: true,
    origin: "Sikkim, India",
    weight: "50g",
    inStock: true,
  },
  {
    _id: "004",
    id: "004",
    name: "Wild Himalayan Cinnamon",
    category: "whole-spices",
    price: 14.99,
    image: "/placeholder.svg",
    description: "Rare wild cinnamon harvested from the Himalayan foothills. More complex and nuanced than common varieties, with notes of citrus and clove.",
    featured: true,
    bestSeller: false,
    origin: "Himalayan Foothills",
    weight: "75g",
    inStock: true,
  },
  {
    _id: "005",
    id: "005",
    name: "Manglanam Garam Masala",
    category: "blends",
    price: 11.99,
    image: "/placeholder.svg",
    description: "Our signature blend of 14 premium spices, perfectly balanced to enhance any dish. This aromatic mix is the secret to authentic Indian cooking.",
    featured: true,
    bestSeller: true,
    origin: "Blended in India",
    weight: "80g",
    inStock: true,
  },
  {
    _id: "006",
    id: "006",
    name: "Tellicherry Black Pepper",
    category: "whole-spices",
    price: 8.99,
    image: "/placeholder.svg",
    description: "These premium peppercorns from Tellicherry are larger and more aromatic than standard black pepper, with complex citrus notes and a slow-building heat.",
    featured: false,
    bestSeller: false,
    origin: "Malabar Coast, India",
    weight: "100g",
    inStock: true,
  },
  {
    _id: "007",
    id: "007",
    name: "Dried Fenugreek Leaves",
    category: "herbs",
    price: 7.99,
    image: "/placeholder.svg",
    description: "Known as 'Kasuri Methi', these dried fenugreek leaves impart a unique bittersweet flavor to curries, dals, and vegetable dishes.",
    featured: false,
    bestSeller: false,
    origin: "Rajasthan, India",
    weight: "30g",
    inStock: true,
  },
  {
    _id: "008",
    id: "008",
    name: "Green Cardamom Pods",
    category: "whole-spices",
    price: 13.99,
    image: "/placeholder.svg",
    description: "Intensely aromatic green cardamom pods, perfect for sweet and savory dishes alike. A staple in chai tea and traditional Indian desserts.",
    featured: true,
    bestSeller: true,
    origin: "Kerala, India",
    weight: "50g",
    inStock: true,
  },
  {
    _id: "009",
    id: "009",
    name: "Madras Curry Powder",
    category: "blends",
    price: 10.99,
    image: "/placeholder.svg",
    description: "A perfectly balanced blend inspired by South Indian cuisine. Medium heat level with bright turmeric notes and complex depth.",
    featured: false,
    bestSeller: true,
    origin: "Blended in India",
    weight: "100g",
    inStock: true,
  },
  {
    _id: "010",
    id: "010",
    name: "Organic Holy Basil",
    category: "herbs",
    price: 9.49,
    image: "/placeholder.svg",
    description: "Sacred Tulsi leaves (Holy Basil) dried to preserve their distinctive clove-like aroma. Perfect for teas and medicinal preparations.",
    featured: true,
    bestSeller: false,
    origin: "Organic Farms, India",
    weight: "40g",
    inStock: true,
  },
  {
    _id: "011",
    id: "011",
    name: "Star Anise",
    category: "whole-spices",
    price: 8.49,
    image: "/placeholder.svg",
    description: "Beautiful star-shaped pods with an intense licorice flavor. Essential for biryanis, masalas, and Chinese five-spice powder.",
    featured: false,
    bestSeller: false,
    origin: "Southern China",
    weight: "50g",
    inStock: true,
  },
  {
    _id: "012",
    id: "012",
    name: "Tandoori Masala",
    category: "blends",
    price: 9.99,
    image: "/placeholder.svg",
    description: "Authentic blend for tandoori dishes. Creates the perfect balance of flavor and that signature red color when marinating meats.",
    featured: false,
    bestSeller: true,
    origin: "Blended in India",
    weight: "80g",
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product._id === id || product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}

export function getBestSellers(): Product[] {
  return products.filter(product => product.bestSeller);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(product => product.category === categoryId);
}

export function searchProducts(query: string): Product[] {
  const lowerCaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerCaseQuery) || 
    product.description.toLowerCase().includes(lowerCaseQuery) ||
    product.category.toLowerCase().includes(lowerCaseQuery)
  );
}
