import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Mock blog posts data (in a real app would come from an API or context)
const mockBlogPosts = [
  {
    id: 'blog-1',
    title: 'Essential Spices Every Home Cook Should Have',
    slug: 'essential-spices-every-home-cook-should-have',
    date: '2025-03-20',
    author: { name: 'Rajesh Kumar', avatar: '/placeholder.svg' },
    featured: true
  },
  {
    id: 'blog-2',
    title: 'The Complete Guide to Turmeric',
    slug: 'complete-guide-to-turmeric',
    date: '2025-03-15',
    author: { name: 'Priya Singh', avatar: '/placeholder.svg' },
    featured: false
  },
  {
    id: 'blog-3',
    title: 'How to Make Authentic Masala Chai',
    slug: 'how-to-make-authentic-masala-chai',
    date: '2025-03-10',
    author: { name: 'Vikram Sharma', avatar: '/placeholder.svg' },
    featured: true
  },
  {
    id: 'blog-4',
    title: 'Spices That Help You Sleep Better',
    slug: 'spices-that-help-you-sleep-better',
    date: '2025-03-05',
    author: { name: 'Anjali Desai', avatar: '/placeholder.svg' },
    featured: false
  },
  {
    id: 'blog-5',
    title: 'The Perfect Biryani Spice Mix',
    slug: 'perfect-biryani-spice-mix',
    date: '2025-02-28',
    author: { name: 'Rajesh Kumar', avatar: '/placeholder.svg' },
    featured: false
  }
];

export default function AdminBlogPosts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter blog posts based on search query
  const filteredBlogPosts = mockBlogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit blog post
  const handleEditBlogPost = (id: string) => {
    navigate(`/admin/blog-posts/edit/${id}`);
  };

  // Handle delete blog post (demo only)
  const handleDeleteBlogPost = (id: string, title: string) => {
    // In a real app, this would be an API call
    toast.success(`Blog post "${title}" deleted successfully (demo)`);
  };

  // Handle view blog post on storefront
  const handleViewBlogPost = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Helmet>
        <title>Blog Posts - Manglanam Admin</title>
      </Helmet>
      
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">Manage your blog content</p>
        </div>
        <Button 
          variant="cinnamon"
          onClick={() => navigate('/admin/blog-posts/add')}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Blog Post
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blog posts..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Desktop view: Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Post Title</th>
                  <th className="text-left p-4">Author</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <Book className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No blog posts found</p>
                      <Button 
                        variant="link" 
                        onClick={() => navigate('/admin/blog-posts/add')}
                        className="mt-2"
                      >
                        Add your first blog post
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredBlogPosts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full overflow-hidden">
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span>{post.author.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {formatDate(post.date)}
                      </td>
                      <td className="p-4">
                        {post.featured ? (
                          <Badge variant="outline" className="bg-cardamom/10 text-cardamom-foreground border-cardamom/20">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline">Published</Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewBlogPost(post.slug)}
                            title="View on website"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditBlogPost(post.id)}
                            title="Edit post"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteBlogPost(post.id, post.title)}
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile view: Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredBlogPosts.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-white dark:bg-gray-800">
            <Book className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No blog posts found</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/admin/blog-posts/add')}
              className="mt-2"
            >
              Add your first blog post
            </Button>
          </div>
        ) : (
          filteredBlogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        /blog/{post.slug}
                      </p>
                    </div>
                    <div>
                      {post.featured ? (
                        <Badge variant="outline" className="bg-cardamom/10 text-cardamom-foreground border-cardamom/20">
                          Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline">Published</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm">{post.author.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewBlogPost(post.slug)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditBlogPost(post.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteBlogPost(post.id, post.title)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
