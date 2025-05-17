import mongoose from 'mongoose';

// Define a schema for product sizes with their respective prices
const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
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
  // Keep price for backward compatibility
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  // Keep salePrice for backward compatibility
  salePrice: {
    type: Number,
    min: 0
  },
  // Add sizes array for weight-based pricing
  sizes: [sizeSchema],
  description: {
    type: String,
    required: [true, 'Description is required']
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
  // Keep weight for backward compatibility
  weight: {
    type: String,
    required: false
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
