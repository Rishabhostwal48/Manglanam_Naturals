import Product from "../models/productModel.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
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

    const count = await Product.countDocuments({
      ...keyword,
      ...category,
      ...featured,
      ...bestSeller,
      ...inStock,
    });

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

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Helper function to ensure image paths are correctly formatted
const normalizeImagePath = (file) => {
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
      image: existingImage, // Rename to avoid confusion
    } = req.body;

    // Get existing images from the form data
    const existingImages = [];
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('existingImages[')) {
        existingImages.push(req.body[key]);
      }
    });

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // Handle main image and additional images from file upload
    let imagePath = existingImage || "";
    let imagesPaths = [...existingImages];

    if (req.files?.image) {
      imagePath = normalizeImagePath(req.files.image[0]);
      console.log('Main image path:', imagePath);
    }

    if (req.files?.images) {
      const newImages = req.files.images.map(file => normalizeImagePath(file));
      imagesPaths = [...imagesPaths, ...newImages];
      console.log('All image paths:', imagesPaths);
    }

    // If we have an existing image URL, use it
    if (existingImage && !imagePath) {
      imagePath = existingImage;
    }

    // Validate image path
    if (!imagePath) {
      return res.status(400).json({ 
        message: "Image is required",
        details: "Please provide either an image file or an image URL"
      });
    }

    const product = new Product({
      name,
      slug,
      category,
      price,
      salePrice,
      description,
      shortDescription: shortDescription || description.substring(0, 100),
      image: imagePath,
      images: imagesPaths,
      featured: featured === "true",
      bestSeller: bestSeller === "true",
      inStock: inStock === "true",
      weight,
      origin,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
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
      details: error.errors
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
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
      product.description = description || product.description;
      product.shortDescription = shortDescription || product.shortDescription;

      // Get existing images from the form data
      const existingImages = [];
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('existingImages[')) {
          existingImages.push(req.body[key]);
        }
      });

      // Handle main image
      if (req.files?.image) {
        product.image = normalizeImagePath(req.files.image[0]);
      } else if (existingImage) {
        product.image = existingImage;
      }

      // Handle additional images
      if (req.files?.images) {
        const newImages = req.files.images.map(file => normalizeImagePath(file));
        product.images = [...existingImages, ...newImages];
      } else {
        product.images = existingImages;
      }

      console.log('Updated images:', {
        main: product.image,
        additional: product.images
      }); // Debug log

      product.featured = featured !== undefined ? featured === "true" : product.featured;
      product.bestSeller = bestSeller !== undefined ? bestSeller === "true" : product.bestSeller;
      product.inStock = inStock !== undefined ? inStock === "true" : product.inStock;
      product.weight = weight || product.weight;
      product.origin = origin || product.origin;

      if (tags) {
        product.tags = tags.split(",").map((tag) => tag.trim());
      }

      const updatedProduct = await product.save();
      console.log('Updated product:', updatedProduct); // Debug log
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

export {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
};
