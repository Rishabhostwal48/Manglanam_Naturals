
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Save, ArrowLeft, Upload } from 'lucide-react';

// Blog post type (similar to the one in data/blog-posts.ts)
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  featured: boolean;
}

interface BlogPostFormProps {
  initialData?: BlogPost;
  isEditing?: boolean;
}

export default function BlogPostForm({ initialData, isEditing = false }: BlogPostFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '/placeholder.svg',
    date: new Date().toISOString().split('T')[0],
    author: {
      name: 'Admin User',
      avatar: '/placeholder.svg',
    },
    featured: false,
  });

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    } else if (!isEditing) {
      // Generate a new ID for new blog posts
      setFormData(prev => ({ 
        ...prev, 
        id: `blog-${Date.now().toString().substring(9)}` 
      }));
    }
  }, [initialData, isEditing]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested object changes
  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      author: { 
        ...prev.author!, 
        [name]: value 
      } 
    }));
  };

  // Handle boolean changes
  const handleBooleanChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (formData.title && !isEditing) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title || '') }));
    }
  }, [formData.title, isEditing]);

  // Handle image upload (demo only)
  const handleImageUpload = () => {
    toast.info("In a real app, this would open a file picker.");
    // In a demo, we'll just set a random number to simulate a new image
    setFormData(prev => ({ 
      ...prev, 
      coverImage: `/placeholder.svg?${Math.random()}` 
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        toast.success(`Blog post "${formData.title}" has been updated!`);
      } else {
        toast.success(`New blog post "${formData.title}" has been created!`);
      }
      setLoading(false);
      navigate('/admin/blog-posts');
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/admin/blog-posts')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Posts
        </Button>

        <Button 
          type="submit" 
          variant="cinnamon" 
          size="sm"
          disabled={loading}
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Post'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title *</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input 
              id="slug" 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              required 
            />
            <p className="text-xs text-muted-foreground">
              This will be used in the URL: /blog/{formData.slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea 
              id="excerpt" 
              name="excerpt" 
              value={formData.excerpt} 
              onChange={handleChange} 
              rows={2} 
              required 
            />
            <p className="text-xs text-muted-foreground">
              A short summary displayed in blog list view
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              rows={8} 
              required 
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border rounded-md overflow-hidden aspect-video bg-gray-50 flex items-center justify-center">
              <img 
                src={formData.coverImage} 
                alt="Cover preview" 
                className="max-h-full object-cover w-full" 
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2" 
              onClick={handleImageUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Cover Image
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name</Label>
              <Input 
                id="authorName" 
                name="name" 
                value={formData.author?.name} 
                onChange={handleAuthorChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Publish Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="featured" className="cursor-pointer">Featured Post</Label>
            <Switch 
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleBooleanChange('featured', checked)}
            />
          </div>
        </Card>
      </div>
    </form>
  );
}
