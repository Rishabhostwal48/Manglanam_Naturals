import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Plus, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const categories = [
  { id: 'whole-spices', name: 'Whole Spices' },
  { id: 'ground-spices', name: 'Ground Spices' },
  { id: 'herbs', name: 'Dried Herbs' },
  { id: 'exotic', name: 'Exotic Spices' },
  { id: 'blends', name: 'Spice Blends' },
];

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const cloudUrl = file.type.startsWith('video/')
    ? `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`
    : `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;

  const res = await fetch(cloudUrl, { method: 'POST', body: formData });
  const data = await res.json();

  if (!data.secure_url) throw new Error('Upload failed');
  return data.secure_url;
};

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
  productId?: string;
}

export default function ProductForm({ initialData, isEditing = false, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to continue');
      navigate('/login', { state: { from: '/admin/products' } });
      return;
    }
    
    if (!isAdmin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'whole-spices',
    description: initialData?.description || '',
    origin: initialData?.origin || '',
    image: initialData?.image || '',
    images: initialData?.images || [],
    video: initialData?.video || '',
    featured: initialData?.featured || false,
    bestSeller: initialData?.bestSeller || false,
    inStock: initialData?.inStock || true,
    hasMultipleSizes: initialData?.hasMultipleSizes || false,
    basePrice: initialData?.basePrice || 0,
    baseSalePrice: initialData?.baseSalePrice || undefined,
  });

  const [sizes, setSizes] = useState(
    initialData?.sizes || [
      { size: '250g', price: 0, salePrice: 0, inStock: true },
      { size: '500g', price: 0, salePrice: 0, inStock: true },
      { size: '1kg', price: 0, salePrice: 0, inStock: true }
    ]
  );

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'additional') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (type === 'image') {
        setFormData(prev => ({ ...prev, image: url }));
      } else if (type === 'video') {
        setFormData(prev => ({ ...prev, video: url }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.image || !formData.origin) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate prices based on product type
    if (formData.hasMultipleSizes) {
      // For multiple sizes, validate all size prices
      const invalidSizes = sizes.filter(size => size.price <= 0);
      if (invalidSizes.length > 0) {
        toast.error('Please enter valid prices for all sizes');
        return;
      }
    } else {
      // For single size, validate base price
      if (!formData.basePrice || formData.basePrice <= 0) {
        toast.error('Please enter a valid base price');
        return;
      }
    }

    try {
      setUploading(true);
      const productData = {
        ...formData,
        // Include sizes only if product has multiple sizes
        sizes: formData.hasMultipleSizes ? sizes.map(size => ({
          ...size,
          price: parseFloat(size.price.toString()),
          salePrice: size.salePrice ? parseFloat(size.salePrice.toString()) : undefined
        })) : [],
        existingImage: formData.image,
        existingImages: formData.images,
      };

      if (isEditing && productId) {
        await productService.updateProduct(productId, productData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(productData);
        toast.success('Product created successfully');
      }

      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
          Back to Products
        </Button>
        <Button type="submit" disabled={uploading}>
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={val => setFormData(prev => ({ ...prev, category: val }))}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
          </div>

          <div>
            <Label>Origin</Label>
            <Input name="origin" value={formData.origin} onChange={handleChange} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Pricing Type</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.hasMultipleSizes}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, hasMultipleSizes: checked }));
                    if (!checked) {
                      // If switching to single size, set basePrice from first size if available
                      const firstSize = sizes[0];
                      if (firstSize) {
                        setFormData(prev => ({
                          ...prev,
                          basePrice: firstSize.price,
                          baseSalePrice: firstSize.salePrice || undefined
                        }));
                      }
                    }
                  }}
                />
                <span className="text-sm text-gray-500">
                  {formData.hasMultipleSizes ? 'Multiple Sizes' : 'Single Size'}
                </span>
              </div>
            </div>

            {formData.hasMultipleSizes ? (
              <div>
                <Label>Pricing by Weight</Label>
                {sizes.map((entry, i) => (
                  <div key={entry.size} className="flex flex-col gap-2 mb-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.size}</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={entry.inStock}
                          onCheckedChange={(checked) => {
                            const newSizes = [...sizes];
                            newSizes[i].inStock = checked;
                            setSizes(newSizes);
                          }}
                        />
                        <span className="text-sm text-gray-500">In Stock</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Regular Price</Label>
                        <Input
                          type="number"
                          value={entry.price}
                          onChange={(e) => {
                            const newSizes = [...sizes];
                            newSizes[i].price = parseFloat(e.target.value) || 0;
                            setSizes(newSizes);
                          }}
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Sale Price (Optional)</Label>
                        <Input
                          type="number"
                          value={entry.salePrice || ''}
                          onChange={(e) => {
                            const newSizes = [...sizes];
                            newSizes[i].salePrice = parseFloat(e.target.value) || 0;
                            setSizes(newSizes);
                          }}
                          min="0"
                          step="0.01"
                          placeholder="Enter sale price"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Regular Price</Label>
                  <Input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label>Sale Price (Optional)</Label>
                  <Input
                    type="number"
                    name="baseSalePrice"
                    value={formData.baseSalePrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalePrice: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="Enter sale price"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={formData.featured} onCheckedChange={val => setFormData(prev => ({ ...prev, featured: val }))} />
                <span>Featured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.bestSeller} onCheckedChange={val => setFormData(prev => ({ ...prev, bestSeller: val }))} />
                <span>Best Seller</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.inStock} onCheckedChange={val => setFormData(prev => ({ ...prev, inStock: val }))} />
                <span>In Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Media Uploads */}
        <div className="space-y-6">
          {/* Main Image Upload */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <Label className="block mb-2 font-medium">Main Product Image</Label>
            {formData.image && (
              <div className="relative w-full h-48 border rounded-md overflow-hidden">
                <img
                  src={formData.image}
                  alt="Main"
                  className="w-full h-full object-contain bg-gray-50"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Main Image'}
            </Button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleUpload(e, 'image')}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Additional Images */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <Label className="block mb-2 font-medium">Additional Images</Label>
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group overflow-hidden border rounded">
                  <img src={img} className="object-cover w-full h-24" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center border-2 border-dashed rounded h-24 hover:bg-gray-50">
                <label className="w-full h-full flex items-center justify-center cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    onChange={(e) => handleUpload(e, 'additional')}
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Product Video */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <Label className="block mb-2 font-medium">Product Video (Optional)</Label>
            {formData.video ? (
              <div className="relative rounded overflow-hidden bg-black">
                <video src={formData.video} controls className="w-full h-48 object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData((prev) => ({ ...prev, video: '' }))}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 h-24 flex items-center justify-center border-2 border-dashed rounded">
                <span className="text-sm text-gray-500">No video uploaded</span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleUpload(e, 'video')}
              accept="video/*"
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
