import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, User, ArrowRight } from "lucide-react";
import type { BlogPostType } from "@shared/schema";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: post, isLoading, isError } = useQuery<BlogPostType>({
    queryKey: [`/api/blog/${id}`],
    enabled: !!id,
  });

  const { data: relatedPosts = [] } = useQuery<any[]>({
    queryKey: [`/api/blog/${id}?related=true`],
    enabled: !!id,
  });

  if (isError) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Blog post not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="aspect-video w-full mb-6 rounded-lg" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-96 object-cover"
          />
          {post.category && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">{post.category}</Badge>
            </div>
          )}
        </div>

        {/* Header */}
        <article className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>By Author</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {post.category && (
                <Badge>{post.category}</Badge>
              )}
            </div>
            {post.excerpt && (
              <p className="text-xl text-muted-foreground italic">{post.excerpt}</p>
            )}
          </div>

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost: BlogPostType) => (
                <Card key={relatedPost._id?.toString()} className="overflow-hidden hover-elevate transition-all cursor-pointer" onClick={() => setLocation(`/blog/${relatedPost._id}`)}>
                  <img
                    src={relatedPost.imageUrl}
                    alt={relatedPost.title}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="pt-4">
                    {relatedPost.category && (
                      <Badge className="mb-2">{relatedPost.category}</Badge>
                    )}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Button variant="outline" onClick={() => setLocation("/blog")} size="lg">
            ← Back to Blog
          </Button>
        </div>
      </div>
    </div>
  );
}
