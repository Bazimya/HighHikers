import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { BlogPost } from "@shared/schema";
import forestTrail from "@assets/generated_images/Forest_trail_easy_hike_8367c201.png";
import mountainRidge from "@assets/generated_images/Mountain_ridge_challenging_trail_b017c93a.png";
import alpineLake from "@assets/generated_images/Alpine_lake_moderate_trail_a28c94b8.png";

export default function Blog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", content: "", category: "", author: "", imageUrl: "" });
  const [error, setError] = useState("");

  const { data: blogPosts = [], isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: typeof blogForm) => {
      const res = await fetch("/api/blog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setBlogForm({ title: "", excerpt: "", content: "", category: "", author: "", imageUrl: "" });
      setShowNewBlogModal(false);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const imageMap: Record<string, string> = {
    "/assets/blog-essentials.jpg": forestTrail,
    "/assets/blog-boots.jpg": mountainRidge,
    "/assets/blog-alpine.jpg": alpineLake,
    "/assets/blog-winter.jpg": mountainRidge,
    "/assets/blog-etiquette.jpg": forestTrail,
    "/assets/blog-backpacks.jpg": alpineLake,
  };

  const categories = ["All", "Tips", "Gear Reviews", "Trail Stories"];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAuthorInitials = (author: any) => {
    const name = typeof author === "string" ? author : author?.username;
    const firstName = name?.split?.(" ")?.[0] ?? "G";
    return firstName[0]?.toUpperCase() ?? "A";
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Hiking Blog & Tips
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Expert advice, trail stories, and gear reviews to enhance your hiking adventures.
            </p>
          </div>
          {user?.role === "admin" && (
            <Dialog open={showNewBlogModal} onOpenChange={setShowNewBlogModal}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                </DialogHeader>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                <div className="space-y-4">
                  <Input placeholder="Post Title" value={blogForm.title} onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} />
                  <Input placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm({...blogForm, author: e.target.value})} />
                  <Select value={blogForm.category} onValueChange={(v) => setBlogForm({...blogForm, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent><SelectItem value="Tips">Tips</SelectItem><SelectItem value="Gear Reviews">Gear Reviews</SelectItem><SelectItem value="Trail Stories">Trail Stories</SelectItem></SelectContent>
                  </Select>
                  <Textarea placeholder="Excerpt (short summary)" value={blogForm.excerpt} onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})} />
                  <Textarea placeholder="Full post content" value={blogForm.content} onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} className="min-h-[200px]" />
                  <Input placeholder="Image URL" value={blogForm.imageUrl} onChange={(e) => setBlogForm({...blogForm, imageUrl: e.target.value})} />
                  <Button onClick={() => createBlogMutation.mutate(blogForm)} disabled={createBlogMutation.isPending} className="w-full">
                    {createBlogMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-blog"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (selectedCategory === null && category === "All") ? "default" : "outline"}
                onClick={() => setSelectedCategory(category === "All" ? null : category)}
                data-testid={`button-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">Failed to load blog posts. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden flex flex-col">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-posts">
              No articles found matching your criteria. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post._id?.toString() || post.id} className="overflow-hidden hover-elevate transition-all flex flex-col" data-testid={`card-post-${post._id?.toString() || post.id}`}>
                <Link href={`/blog/${post._id?.toString() || post.id}`}>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={imageMap[post.imageUrl] || forestTrail}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground" data-testid={`badge-category-${post._id?.toString() || post.id}`}>
                    {post.category}
                  </Badge>
                </div>

                <CardHeader className="flex-1">
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {post.excerpt}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getAuthorInitials(post.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="text-foreground font-medium">
                          {typeof post.author === "string" ? post.author : post.author?.username || "Anonymous"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                    <span>{post.publishedAt}</span>
                  </div>

                  <Button variant="outline" className="w-full" data-testid={`button-read-${post.id}`}>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
