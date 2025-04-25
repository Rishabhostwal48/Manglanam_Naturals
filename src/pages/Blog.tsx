
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blog-posts";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(blogPosts.flatMap((post) => post.categories))
  );

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? post.categories.includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-custom py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Manglanam Spice Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover delicious recipes, cooking tips, and learn about the rich history of spices from around the world.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-5 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes and articles..."
              className="pl-10 h-12 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <div className="mb-16">
          <Link to={`/blog/${filteredPosts[0].slug}`}>
            <div className="group relative overflow-hidden rounded-2xl shadow-md">
              <div className="aspect-[16/9] md:aspect-[21/9]">
                <img
                  src={filteredPosts[0].image}
                  alt={filteredPosts[0].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-end">
                <div className="flex flex-wrap gap-2 mb-4">
                  {filteredPosts[0].categories.map((category) => (
                    <Badge key={category} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      <Tag className="h-3.5 w-3.5 mr-1.5" />
                      {category}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-primary/90 transition-colors">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-white/90 mb-5 max-w-3xl text-lg">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center text-white/80 text-sm">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{filteredPosts[0].date}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.slice(1).map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="group">
            <div className="h-full rounded-xl overflow-hidden border bg-card transition-all hover:shadow-lg">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {category}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-muted-foreground text-sm mt-auto">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl">
          <h3 className="text-xl font-medium mb-3">No posts found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button 
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
            }}
            className="rounded-full"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Blog;
