import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Product, categories } from '@/data/products';
import { productService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Upload, X, Film, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
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
    weight: initialData?.weight || '',
    inStock: initialData?.inStock ?? true,
    salePrice: initialData?.salePrice || undefined,
  });
  
  // Additional state for image uploads
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.salePrice && formData.salePrice >= formData.price) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.weight?.trim()) {
      newErrors.weight = 'Weight is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleNumberChange}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (Optional)</Label>
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice || ''}
                  onChange={handleNumberChange}
                  placeholder="0.00"
                />
                {errors.salePrice && (
                  <p className="text-sm text-destructive">{errors.salePrice}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 100g, 1kg"
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Product Images, Gallery & Video */}
        <Card className="p-6 space-y-6">
          <div className="space-y-6">
            {/* Main Product Image */}
            <div className="space-y-2">
              <Label>Main Product Image</Label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.image}
                    alt={formData.name || 'Product preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span>{uploadLoading ? 'Uploading...' : 'Upload Main Image'}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Additional Images Gallery */}
            <div className="space-y-2">
              <Label>Additional Images</Label>
              
              {/* Display existing additional images */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={`gallery-${index}`} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imageUrl)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload additional image */}
              <div className="w-full">
                <Label htmlFor="additional-image" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                    <input
                      id="additional-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAdditionalImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <span>{uploadingAdditionalImage ? 'Uploading...' : 'Add Gallery Image'}</span>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
            
            {/* Product Video */}
            <div className="space-y-2">
              <Label>Product Video</Label>
              
              {/* Display existing video */}
              {formData.video ? (
                <div className="relative mb-4 group">
                  {/* Add debugging information */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Raw Video URL: {formData.video}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Full Video URL: {formData.video.startsWith('http') 
                        ? formData.video 
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.video}`}
                    </p>
                    <div className="relative">
                      {/* Use a more reliable video player approach */}
                      <video 
                        key={formData.video} // Add key to force re-render when URL changes
                        className="w-full h-auto rounded-md"
                        controls
                        preload="metadata"
                        onLoadStart={() => console.log('Video load started')}
                        onLoadedData={() => console.log('Video data loaded successfully')}
                        onError={(e) => {
                          console.error('Video loading error:', e);
                          toast.error('Error loading video. Please check console for details.');
                        }}
                      >
                        {/* Use source element instead of src attribute for better browser compatibility */}
                        <source 
                          src={formData.video} 
                          type={formData.video.endsWith('.mp4') ? 'video/mp4' : 
                               formData.video.endsWith('.webm') ? 'video/webm' : 
                               formData.video.endsWith('.mov') ? 'video/quicktime' : 
                               'video/mp4'}
                        />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Add a direct link to the video for testing */}
                      <div className="mt-2">
                        <a 
                          href={formData.video} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Open video in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Video URL: {formData.video}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove video"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No video uploaded</p>
              )}
              
              {/* Upload video */}
              {!formData.video && (
                <div className="w-full">
                  <Label htmlFor="video" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <input
                        id="video"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Film className="h-4 w-4" />
                        <span>{uploadingVideo ? 'Uploading...' : 'Upload Product Video'}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this product on the home page
                  </p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleBooleanChange('featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Best Seller</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this product as a best seller
                  </p>
                </div>
                <Switch
                  checked={formData.bestSeller}
                  onCheckedChange={(checked) => handleBooleanChange('bestSeller', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In Stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Product availability status
                  </p>
                </div>
                <Switch
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleBooleanChange('inStock', checked)}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}