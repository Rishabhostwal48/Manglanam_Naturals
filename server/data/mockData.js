// Mock data for development when MongoDB is not available

export const mockProducts = [
  {
    _id: "1",
    name: "Cardamom Pods",
    slug: "cardamom-pods",
    category: "whole-spices",
    price: 12.99,
    description: "Premium green cardamom pods with a complex, slightly sweet flavor.",
    image: "/uploads/sample-product.svg",
    featured: true,
    bestSeller: true,
    inStock: true,
    weight: "100g",
    origin: "India"
  },
  {
    _id: "2",
    name: "Cinnamon Sticks",
    slug: "cinnamon-sticks",
    category: "whole-spices",
    price: 8.99,
    description: "Aromatic cinnamon sticks perfect for teas, desserts, and curries.",
    image: "/uploads/sample-product.svg",
    featured: true,
    bestSeller: false,
    inStock: true,
    weight: "100g",
    origin: "Sri Lanka"
  },
  {
    _id: "3",
    name: "Turmeric Powder",
    slug: "turmeric-powder",
    category: "ground-spices",
    price: 7.99,
    description: "Vibrant yellow turmeric powder with earthy, peppery flavor.",
    image: "/uploads/sample-product.svg",
    featured: false,
    bestSeller: true,
    inStock: true,
    weight: "100g",
    origin: "India"
  },
  {
    _id: "4",
    name: "Garam Masala",
    slug: "garam-masala",
    category: "blends",
    price: 9.99,
    description: "Traditional Indian spice blend for curries and other dishes.",
    image: "/uploads/sample-product.svg",
    featured: true,
    bestSeller: true,
    inStock: true,
    weight: "100g",
    origin: "India"
  }
];

export const mockUsers = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$eCFKgBnOWh7F4KxZ4oz6FOXUvK/Na1TE8LrMdLYcJRl/tHHxTgDFa", // "password123"
    isAdmin: true
  },
  {
    _id: "2",
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$eCFKgBnOWh7F4KxZ4oz6FOXUvK/Na1TE8LrMdLYcJRl/tHHxTgDFa", // "password123"
    isAdmin: false
  }
];

export const mockOrders = [
  {
    _id: "1",
    user: "2",
    orderItems: [
      {
        name: "Cardamom Pods",
        qty: 2,
        image: "/uploads/sample-product.svg",
        price: 12.99,
        product: "1"
      }
    ],
    shippingAddress: {
      address: "123 Main St",
      city: "Boston",
      postalCode: "02108",
      country: "USA"
    },
    paymentMethod: "PayPal",
    paymentResult: {
      id: "PAY-123456789",
      status: "COMPLETED",
      update_time: "2023-01-01T12:00:00Z",
      email_address: "john@example.com"
    },
    itemsPrice: 25.98,
    taxPrice: 2.60,
    shippingPrice: 5.00,
    totalPrice: 33.58,
    isPaid: true,
    paidAt: "2023-01-01T12:00:00Z",
    isDelivered: false
  }
];

// Helper function to get mock data
export const getMockData = (collection) => {
  switch (collection) {
    case 'products':
      return [...mockProducts];
    case 'users':
      return [...mockUsers];
    case 'orders':
      return [...mockOrders];
    default:
      return [];
  }
};