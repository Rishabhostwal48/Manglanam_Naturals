import mongoose from 'mongoose';
import Product from "../models/productModel.js";

// Flag to indicate if we're using mock data (will be set if MongoDB connection fails)
let useMockData = false;

// Check MongoDB connection
try {
  // This will throw an error if Mongoose is not connected
  if (mongoose?.connection?.readyState === 1) {
    console.log('MongoDB not connected, using mock data');
    useMockData = false;
  }
} catch (error) {
  console.log('Error checking MongoDB connection, using mock data');
  useMockData = true;
}

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    console.log('GET /api/products request received with query:', req.query);
    
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    // If using mock data, handle filtering and pagination in memory
    if (useMockData) {
      console.log('Using mock data for products');
      let mockProducts = getMockData('products');
      
      // Apply filters
      if (req.query.keyword) {
        const keyword = req.query.keyword.toLowerCase();
        mockProducts = mockProducts.filter(p => 
          p.name.toLowerCase().includes(keyword) || 
          p.description.toLowerCase().includes(keyword)
        );
      }
      
      if (req.query.category) {
        mockProducts = mockProducts.filter(p => p.category === req.query.category);
      }
      
      if (req.query.featured === "true") {
        mockProducts = mockProducts.filter(p => p.featured);
      }
      
      if (req.query.bestSeller === "true") {
        mockProducts = mockProducts.filter(p => p.bestSeller);
      }
      
      if (req.query.inStock === "true") {
        mockProducts = mockProducts.filter(p => p.inStock);
      }
      
      // Apply sorting
      if (req.query.sort) {
        switch (req.query.sort) {
          case 'price-asc':
            mockProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            mockProducts.sort((a, b) => b.price - a.price);
            break;
          case 'name-asc':
            mockProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-desc':
            mockProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        }
      }
      
      // Apply pagination
      const totalProducts = mockProducts.length;
      const startIndex = pageSize * (page - 1);
      const paginatedProducts = mockProducts.slice(startIndex, startIndex + pageSize);
      
      const response = {
        products: paginatedProducts,
        page,
        pages: Math.ceil(totalProducts / pageSize),
        totalProducts,
      };
      
      console.log('Returning mock products:', {
        productsCount: response.products.length,
        page: response.page,
        pages: response.pages,
        totalProducts: response.totalProducts
      });
      
      return res.json(response);
    }
    
    // If not using mock data, continue with MongoDB query
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const featured = req.query.featured ? { featured: req.query.featured === "true" } : {};
    const bestSeller = req.query.bestSeller ? { bestSeller: req.query.bestSeller === "true" } : {};
    const inStock = req.query.inStock ? { inStock: req.query.inStock === "true" } : {};

    // Build sort object based on sort parameter
    let sort = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'name-asc':
          sort = { name: 1 };
          break;
        case 'name-desc':
          sort = { name: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    // Log the filter criteria
    console.log('Product filter criteria:', {
      keyword,
      category,
      featured,
      bestSeller,
      inStock,
      sort
    });

    const count = await Product.countDocuments({
      ...keyword,
      ...category,
      ...featured,
      ...bestSeller,
      ...inStock,
    });

    console.log(`Found ${count} products matching criteria`);

    const products = await Product.find({
      ...keyword,
      ...category,
      ...featured,
      ...bestSeller,
      ...inStock,
    })
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    console.log(`Returning ${products.length} products for page ${page}`);
    
    // If no products found, return empty array instead of null
    const response = {
      products: products || [],
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    };
    
    console.log('Response structure:', {
      productsCount: response.products.length,
      page: response.page,
      pages: response.pages,
      totalProducts: response.totalProducts
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    
    // Fallback to mock data on error
    try {
      console.log('Falling back to mock data due to error');
      const mockProducts = getMockData('products');
      const response = {
        products: mockProducts,
        page: 1,
        pages: 1,
        totalProducts: mockProducts.length,
      };
      res.json(response);
    } catch (fallbackError) {
      res.status(500).json({ 
        message: "Server Error", 
        error: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    if (useMockData) {
      const mockProducts = getMockData('products');
      const product = mockProducts.find(p => p._id === req.params.id);
      
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    let product;
    
    // First try to find by ID if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    
    // If not found by ID, try to find by slug
    if (!product) {
      product = await Product.findOne({ slug: req.params.id });
    }

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error('Error in getProductById:', error);
    
    // Fallback to mock data on error
    try {
      const mockProducts = getMockData('products');
      const product = mockProducts.find(p => p._id === req.params.id || p.slug === req.params.id);
      
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    } catch (fallbackError) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    if (useMockData) {
      const mockProducts = getMockData('products');
      const product = mockProducts.find(p => p.slug === req.params.slug);
      
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const product = await Product.findOne({ slug: req.params.slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    
    // Fallback to mock data on error
    try {
      const mockProducts = getMockData('products');
      const product = mockProducts.find(p => p.slug === req.params.slug);
      
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    } catch (fallbackError) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
};

// Helper function to ensure file paths are correctly formatted
const normalizeFilePath = (file) => {
  if (!file) return '';
  return `/uploads/${file.filename}`;
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Received files:', req.files);

    // ✅ Destructure all required fields from req.body
    const {
      name,
      category,
      description,
      shortDescription,
      featured,
      bestSeller,
      inStock,
      origin,
      tags,
      sizes,
      image,
      images,
      video,
      hasMultipleSizes,
      basePrice,
      baseSalePrice
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // Handle images and video
    let imagePath = image || "";
    let imagesPaths = images || [];
    let videoPath = video || "";

    // If files were uploaded through multer, use those paths
    if (req.files?.image) {
      imagePath = req.files.image[0].path;
    }
    if (req.files?.images) {
      const newImages = req.files.images.map((file) => file.path);
      imagesPaths = [...imagesPaths, ...newImages];
    }
    if (req.files?.video) {
      videoPath = req.files.video[0].path;
    }

    // Validate image
    if (!imagePath) {
      return res.status(400).json({
        message: "Image is required",
        details: "Please provide either an image file or an image URL",
      });
    }

    // ✅ Parse sizes if it comes as a JSON string from frontend
    let parsedSizes = [];
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (e) {
      console.error('Invalid sizes format:', sizes);
    }

    // ✅ Construct the product object
    const product = new Product({
      name,
      slug,
      category,
      description,
      shortDescription: shortDescription || description?.substring(0, 100),
      image: imagePath,
      images: imagesPaths,
      video: videoPath,
      featured: featured === 'true' || featured === true,
      bestSeller: bestSeller === 'true' || bestSeller === true,
      inStock: inStock === 'true' || inStock === true,
      origin,
      hasMultipleSizes: hasMultipleSizes === 'true' || hasMultipleSizes === true,
      basePrice: hasMultipleSizes ? undefined : Number(basePrice),
      baseSalePrice: hasMultipleSizes ? undefined : Number(baseSalePrice),
      sizes: hasMultipleSizes ? parsedSizes : [],
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      rating: 0,
      reviewCount: 0,
    });

    const createdProduct = await product.save();
    console.log('Created product:', createdProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
      details: error.errors,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    console.log('Updating product with ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Update files:', req.files);
    
    const {
      name,
      category,
      price,
      salePrice,
      description,
      shortDescription,
      featured,
      bestSeller,
      inStock,
      weight,
      origin,
      tags,
      existingImage,
      existingImages,
      video,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;

      // Update slug if name changes
      if (name && name !== product.name) {
        product.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-");
      }

      product.category = category || product.category;
      product.price = price || product.price;
      product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
      
      // Update description fields
      if (description !== undefined) {
        product.description = description;
      }
      if (shortDescription !== undefined) {
        product.shortDescription = shortDescription;
      }

      // Handle main image
      if (req.files?.image) {
        product.image = normalizeFilePath(req.files.image[0]);
      } else if (existingImage) {
        product.image = existingImage;
      }

      // Handle additional images
      if (req.files?.images) {
        const newImages = req.files.images.map(file => normalizeFilePath(file));
        product.images = [...(existingImages || []), ...newImages];
      } else if (existingImages) {
        product.images = Array.isArray(existingImages) ? existingImages : [existingImages];
      }

      console.log('Updated images:', {
        main: product.image,
        additional: product.images
      });

      product.featured = featured !== undefined ? featured === "true" : product.featured;
      product.bestSeller = bestSeller !== undefined ? bestSeller === "true" : product.bestSeller;
      product.inStock = inStock !== undefined ? inStock === "true" : product.inStock;
      product.weight = weight || product.weight;
      product.origin = origin || product.origin;
      
      // Handle video field
      if (video !== undefined) {
        product.video = video;
      }

      if (tags) {
        product.tags = tags.split(",").map((tag) => tag.trim());
      }

      const updatedProduct = await product.save();
      console.log('Updated product:', updatedProduct);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    if (useMockData) {
      // Use mock data
      const allProducts = getMockData('products');
      const featuredProducts = allProducts.filter(p => p.featured).slice(0, 8);
      return res.json(featuredProducts);
    }
    
    // Use MongoDB
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    console.error('Error in getFeaturedProducts controller:', error);
    
    // Fallback to mock data on error
    const allProducts = getMockData('products');
    const featuredProducts = allProducts.filter(p => p.featured).slice(0, 8);
    res.json(featuredProducts);
  }
};

// @desc    Fetch best selling products
// @route   GET /api/products/bestsellers
// @access  Public
const getBestSellerProducts = async (req, res) => {
  try {
    if (useMockData) {
      // Use mock data
      const allProducts = getMockData('products');
      const bestSellers = allProducts.filter(p => p.bestSeller).slice(0, 8);
      return res.json(bestSellers);
    }
    
    // Use MongoDB
    const products = await Product.find({ bestSeller: true }).limit(8);
    res.json(products);
  } catch (error) {
    console.error('Error in getBestSellerProducts controller:', error);
    
    // Fallback to mock data on error
    const allProducts = getMockData('products');
    const bestSellers = allProducts.filter(p => p.bestSeller).slice(0, 8);
    res.json(bestSellers);
  }
};

// @desc    Fetch products by IDs
// @route   GET /api/products/by-ids
// @access  Public
const getProductsByIds = async (req, res) => {  
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: "No product IDs provided" });
    }
    
    const productIds = ids.split(',');
    
    if (useMockData) {
      const mockProducts = getMockData('products');
      const products = mockProducts.filter(p => productIds.includes(p._id.toString()));
      return res.json({ products });
    }
    
    const products = await Product.find({
      _id: { $in: productIds }
    });
    
    res.json({ products });
  } catch (error) {
    console.error('Error in getProductsByIds controller:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getFeaturedProducts,
  getBestSellerProducts,
  getProductsByIds,
};
