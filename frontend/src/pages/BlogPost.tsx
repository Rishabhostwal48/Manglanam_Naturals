
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blog-posts";
import { Separator } from "@/components/ui/separator";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = blogPosts.find((post) => post.slug === slug);
  
  if (!post) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <p className="mb-6 text-muted-foreground">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }
  
  // Find related posts based on categories
  const relatedPosts = blogPosts
    .filter(
      (p) => 
        p.id !== post.id && 
        p.categories.some(cat => post.categories.includes(cat))
    )
    .slice(0, 3);
    
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 hover:bg-primary/5 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {/* Post Header */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-5">
            {post.categories.map((category) => (
              <Badge key={category} variant="outline" className="rounded-full">
                <Tag className="h-3 w-3 mr-1.5" />
                {category}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-5 text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              <span>By Manglanam Team</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{post.date}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
        
        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden mb-12 shadow-md">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <Separator className="my-16" />
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-8">You might also like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="rounded-xl overflow-hidden border bg-card h-full transition-all hover:shadow-md">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h4>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        <span>{relatedPost.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
