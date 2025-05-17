import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {  categories } from '@/data/products';
import { productService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Upload, X, Film, Image as ImageIcon, Plus, Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Define ProductSize interface
interface ProductSize {
  size: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  video?: string;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  origin: string;
  weight: string | string[];
  inStock: boolean;
  salePrice?: number;
  sizes?: ProductSize[]; // <-- update to match your usage
}

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

interface ProductSize {
  size: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
}


export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Default weight options
  const defaultWeights = ['100g', '250g', '500g', '1kg'];
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    _id: initialData?._id ? (typeof initialData._id === 'object' ? initialData._id.toString() : initialData._id) : '',
    name: initialData?.name || '',
    category: initialData?.category || 'whole-spices',
    price: initialData?.price || 0,
    image: initialData?.image || '/placeholder.svg',
    images: initialData?.images || [],
    video: initialData?.video || '',
    description: initialData?.description || '',
    featured: initialData?.featured || false,
    bestSeller: initialData?.bestSeller || false,
    origin: initialData?.origin || '',
    weight: Array.isArray(initialData?.weight)
      ? (initialData?.weight[0] ?? '250g')
      : (initialData?.weight ?? '250g'), // Default weight for backward compatibility
    inStock: initialData?.inStock ?? true,
    salePrice: initialData?.salePrice || undefined,
    sizes: initialData?.sizes || []
  });
  
  // Additional state for image uploads
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize default sizes if none exist
  useEffect(() => {
    if (!formData.sizes || formData.sizes.length === 0) {
      // Create default sizes based on the base price
      const basePrice = formData.price || 0;
      const defaultSizes: ProductSize[] = [
        { size: '100g', price: Math.round(basePrice * 0.5), salePrice: formData.salePrice ? Math.round(formData.salePrice * 0.5) : undefined, inStock: true },
        { size: '250g', price: basePrice, salePrice: formData.salePrice, inStock: true },
        { size: '500g', price: Math.round(basePrice * 1.8), salePrice: formData.salePrice ? Math.round(formData.salePrice * 1.8) : undefined, inStock: true },
        { size: '1kg', price: Math.round(basePrice * 3.5), salePrice: formData.salePrice ? Math.round(formData.salePrice * 3.5) : undefined, inStock: true }
      ];
      
      setFormData(prev => ({
        ...prev,
        sizes: defaultSizes
      }));
    }
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required';
    }

    // Validate base price for backward compatibility
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Base price must be greater than 0';
    }

    if (formData.salePrice && formData.salePrice >= formData.price) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate sizes array
    const sizes = formData.sizes || [];
    if (sizes.length === 0) {
      newErrors.sizes = 'At least one weight option with price is required';
    } else {
      // Check if each size has valid price
      const invalidSizes = Array.isArray(sizes)
        ? sizes.filter(size => !size.price || size.price <= 0)
        : [];
      if (invalidSizes.length > 0) {
        newErrors.sizes = 'All weight options must have a valid price';
      }
      
      // Check for duplicate sizes
      const sizeNames = Array.isArray(sizes) ? sizes.map(s => s.size) : [];
      const hasDuplicates = sizeNames.some((size, index) => sizeNames.indexOf(size) !== index);
      if (hasDuplicates) {
        newErrors.sizes = 'Weight options must be unique';
      }
      
      // Check if any size is empty
      const hasEmptySize = Array.isArray(sizes) && sizes.some(s => !s.size.trim());
      if (hasEmptySize) {
        newErrors.sizes = 'All weight options must have a name';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Add a new size option
  const addSizeOption = () => {
    setFormData(prev => {
      const currentSizes = prev.sizes || [];
      // Use base price for new size option
      return {
        ...prev,
        sizes: [
          ...currentSizes,
          {
            size: '',
            price: prev.price || 0,
            salePrice: prev.salePrice,
            inStock: true
          }
        ]
      };
    });
  };
  
  // Remove a size option
  const removeSizeOption = (index: number) => {
    setFormData(prev => {
      const currentSizes = [...(prev.sizes || [])];
      currentSizes.splice(index, 1);
      return {
        ...prev,
        sizes: currentSizes
      };
    });
  };
  
  // Update a size option
  const updateSizeOption = (index: number, field: keyof ProductSize, value: any) => {
    setFormData(prev => {
      const currentSizes = [...(prev.sizes || [])];
      if (currentSizes[index]) {
        currentSizes[index] = {
          ...currentSizes[index],
          [field]: value
        };
      }
      return {
        ...prev,
        sizes: currentSizes
      };
    });
    
    // Clear error when user updates sizes
    if (errors.sizes) {
      setErrors(prev => ({ ...prev, sizes: '' }));
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Handle boolean changes
  const handleBooleanChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle main image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);

    try {
      const response = await productService.uploadProductImage(formData);
      setFormData(prev => ({ ...prev, image: response.image }));
      
      // Also add to images array if it's not already there
      setFormData(prev => {
        const currentImages = prev.images || [];
        if (!currentImages.includes(response.image)) {
          return { ...prev, images: [response.image, ...currentImages] };
        }
        return prev;
      });
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Handle additional image upload
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingAdditionalImage(true);

    try {
      const response = await productService.uploadProductImage(formData);
      
      // Add to images array if it's not already there
      setFormData(prev => {
        const currentImages = prev.images || [];
        if (!currentImages.includes(response.image)) {
          return { ...prev, images: [...currentImages, response.image] };
        }
        return prev;
      });
      
      toast.success('Additional image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAdditionalImage(false);
    }
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Video file selected:', file.name, file.type, file.size);

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid video file (MP4, WebM, or QuickTime)');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('Video size should be less than 50MB');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    setUploadingVideo(true);

    try {
      console.log('Uploading video...');
      // Assuming your API has a method for uploading videos
      const response = await productService.uploadProductVideo(formData);
      console.log('Video upload response:', response);
      
      if (response && (response.video || response.fullVideoUrl)) {
        // Use the full URL if available, otherwise use the relative path
        const videoUrl = response.fullVideoUrl || response.video;
        console.log('Setting video URL:', videoUrl);
        setFormData(prev => ({ ...prev, video: videoUrl }));
        toast.success('Video uploaded successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingVideo(false);
    }
  };
  
  // Remove an image from the images array
  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => {
      const currentImages = prev.images || [];
      return { ...prev, images: currentImages.filter(img => img !== imageUrl) };
    });
    toast.success('Image removed');
  };
  
  // Remove the video
  const handleRemoveVideo = () => {
    setFormData(prev => ({ ...prev, video: '' }));
    toast.success('Video removed');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Update the default price and salePrice based on the 250g size (or first size if no 250g)
      const defaultSize = formData.sizes?.find(s => s.size === '250g') || formData.sizes?.[0];
      if (defaultSize) {
        setFormData(prev => ({
          ...prev,
          price: defaultSize.price,
          salePrice: defaultSize.salePrice
        }));
      }

      if (isEditing && initialData) {
        // Make sure the ID is a string, not an object
        const productId = typeof initialData._id === 'object' ? initialData._id.toString() : initialData._id;
        const updatedProduct = await productService.updateProduct(productId, formData);
        console.log('Product updated successfully:', updatedProduct);
        toast.success(`Product ${formData.name} updated successfully`);
        // Navigate after successful update
        setTimeout(() => navigate('/admin/products'), 1000);
      } else {
        const newProduct = await productService.createProduct(formData);
        console.log('Product created successfully:', newProduct);
        toast.success('Product created successfully');
        // Navigate after successful creation
        setTimeout(() => navigate('/admin/products'), 1000);
      }
    } catch (error) {
      console.error('Product submission error:', error);
      toast.error('Failed to submit product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <Button 
          type="submit" 
          variant="cinnamon"
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Details */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Enter product origin"
              />
            </div>

            {/* Weight-based Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Weight Options & Pricing</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addSizeOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Weight Option
                </Button>
              </div>
              
              {errors.sizes && (
                <p className="text-sm text-destructive">{errors.sizes}</p>
              )}
              
              <div className="space-y-3">
                {formData.sizes && formData.sizes.map((size, index) => (
                  <div key={index} className="flex flex-col space-y-2 p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Weight Option {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSizeOption(index)}
                        disabled={formData.sizes?.length === 1}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`size-${index}`}>Weight</Label>
                        <Input
                          id={`size-${index}`}
                          value={size.size}
                          onChange={(e) => updateSizeOption(index, 'size', e.target.value)}
                          placeholder="e.g., 100g, 250g, 1kg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`inStock-${index}`}>In Stock</Label>
                        <div className="flex items-center h-10 space-x-2">
                          <Switch
                            id={`inStock-${index}`}
                            checked={size.inStock}
                            onCheckedChange={(checked) => updateSizeOption(index, 'inStock', checked)}
                          />
                          <span>{size.inStock ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    
`                    <div className="grid grid-cols-2 gap-3">
`                      <div>
                        <Label htmlFor={`price-${index}`}>Price</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={size.price}
                          onChange={(e) => updateSizeOption(index, 'price', parseFloat(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`salePrice-${index}`}>Sale Price (Optional)</Label>
                        <Input
                          id={`salePrice-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={size.salePrice || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            updateSizeOption(index, 'salePrice', value);
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-medium">Product Status</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleBooleanChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bestSeller"
                    checked={formData.bestSeller}
                    onCheckedChange={(checked) => handleBooleanChange('bestSeller', checked)}
                  />
                  <Label htmlFor="bestSeller">Best Seller</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleBooleanChange('inStock', checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Product Images, Gallery & Video */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Main Product Image</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-gray-50">
                {formData.image && formData.image !== '/placeholder.svg' ? (
                  <div className="relative w-full">
                    <img
                      src={formData.image}
                      alt="Product"
                      className="w-full h-auto max-h-64 object-contain mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => setFormData(prev => ({ ...prev, image: '/placeholder.svg' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Upload a main product image</p>
                    </div>
                  </div>
                )}
                <div className="mt-4 w-full">
                  <label className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        'Uploading...'
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadLoading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.images && formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-2 border-dashed rounded-md flex items-center justify-center p-4 h-24">
                  <label className="cursor-pointer text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs mt-1">Add Image</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAdditionalImageUpload}
                      disabled={uploadingAdditionalImage}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Video (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
                {formData.video ? (
                  <div className="relative">
                    <video
                      src={formData.video}
                      controls
                      className="w-full h-auto max-h-64"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={handleRemoveVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Film className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Upload a product video (optional)</p>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <label className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? (
                        'Uploading...'
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}