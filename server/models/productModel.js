import mongoose from 'mongoose';

// Define a schema for product sizes with their respective prices
const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: [true, 'Size is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  hasMultipleSizes: {
    type: Boolean,
    required: true,
    default: true
  },
  basePrice: {
    type: Number,
    validate: {
      validator: function(price) {
        // Require basePrice only for single size products
        if (!this.hasMultipleSizes) {
          return price && price > 0;
        }
        return true; // No validation needed for multiple size products
      },
      message: 'Base price is required for single size products'
    }
  },
  baseSalePrice: {
    type: Number,
    min: [0, 'Base sale price cannot be negative']
  },
  sizes: {
    type: [sizeSchema],
    validate: {
      validator: function(sizes) {
        // Only require sizes array if hasMultipleSizes is true
        if (this.hasMultipleSizes) {
          return sizes && sizes.length > 0;
        }
        return true; // No validation needed for single size products
      },
      message: 'At least one size is required for products with multiple sizes'
    }
  },
  shortDescription: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: [true, 'Main image is required']
  },
  images: [String],
  video: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  origin: {
    type: String,
    required: [true, 'Origin is required']
  },
  tags: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Create slug from name
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
