import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// This would come from your actual data in a real app
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

export default function EditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Simulate API call to get blog post
      // In a real app, this would fetch from your API
      setTimeout(() => {
        // Demo data - in real app would come from API
        const mockBlogPost: BlogPost = {
          id: id as string,
          title: "Sample Blog Post",
          slug: "sample-blog-post",
          excerpt: "This is a sample blog post for demonstration purposes",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          coverImage: "/placeholder.svg",
          date: new Date().toISOString().split('T')[0],
          author: {
            name: "Admin User",
            avatar: "/placeholder.svg"
          },
          featured: true
        };
        
        setBlogPost(mockBlogPost);
        setLoading(false);
      }, 500);
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!blogPost) {
    return (
      <div className="p-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/admin/blog-posts')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Posts
        </Button>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold">Blog Post Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Helmet>
        <title>Edit Blog Post - Manglanam Admin</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground">Editing "{blogPost.title}"</p>
      </header>
      
      <BlogPostForm initialData={blogPost} isEditing={true} />
    </div>
  );
}
