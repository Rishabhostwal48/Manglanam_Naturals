import { Helmet } from 'react-helmet-async';
import BlogPostForm from '@/components/admin/BlogPostForm';

export default function AddBlogPost() {
  return (
    <div className="p-6">
      <Helmet>
        <title>Add Blog Post - Manglanam Admin</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Add New Blog Post</h1>
        <p className="text-muted-foreground">Create a new article for your blog</p>
      </header>
      
      <BlogPostForm />
    </div>
  );
}
