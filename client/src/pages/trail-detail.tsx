import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, TrendingUp, Users, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import type { TrailType } from "@shared/schema";
import forestTrail from "@assets/generated_images/Forest_trail_easy_hike_8367c201.png";
import mountainRidge from "@assets/generated_images/Mountain_ridge_challenging_trail_b017c93a.png";
import alpineLake from "@assets/generated_images/Alpine_lake_moderate_trail_a28c94b8.png";

export default function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");

  const imageMap: Record<string, string> = {
    "/assets/forest-trail.jpg": forestTrail,
    "/assets/mountain-ridge.jpg": mountainRidge,
    "/assets/alpine-lake.jpg": alpineLake,
  };

  const { data: trail, isLoading, isError } = useQuery<TrailType>({
    queryKey: [`/api/trails/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: [`/api/trails/${id}/reviews`],
    enabled: !!id,
  });

  const { data: isRegistered = false } = useQuery<boolean>({
    queryKey: [`/api/user/trail-registrations/${id}`],
    enabled: !!id && !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/trails/${id}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Registered!", description: "You're registered for this trail" });
      queryClient.invalidateQueries({ queryKey: [`/api/user/trail-registrations`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to register", variant: "destructive" });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!rating || !reviewText || reviewText.length < 10) {
        throw new Error("Review must be at least 10 characters and have a rating");
      }
      
      const res = await fetch(`/api/trails/${id}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Review submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Review posted!", description: "Thank you for your feedback" });
      setRating(0);
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: [`/api/trails/${id}/reviews`] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to post review", 
        variant: "destructive" 
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Trail not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="aspect-video w-full mb-6 rounded-lg" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!trail) return null;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          <img
            src={imageMap[trail.imageUrl] || forestTrail}
            alt={trail.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className={getDifficultyColor(trail.difficulty)} data-testid="badge-difficulty">
              {trail.difficulty}
            </Badge>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{trail.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-5 w-5" />
            <span>{trail.location}</span>
          </div>

          {/* Rating */}
          {trail.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(trail.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="font-semibold">{trail.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({trail.reviewCount} reviews)</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Distance</div>
              <div className="text-2xl font-bold">{trail.distance}</div>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Elevation</div>
              <div className="text-2xl font-bold">{trail.elevation}</div>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-2xl font-bold">{trail.duration}</div>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Difficulty</div>
              <div className="text-2xl font-bold">{trail.difficulty}</div>
            </div>
          </div>

          {/* Register Button */}
          {user && (
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending || isRegistered}
              size="lg"
              data-testid="button-register-trail"
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Registered for this trail
                </>
              ) : (
                "Register for this Trail"
              )}
            </Button>
          )}
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About this Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{trail.description}</p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reviews & Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Write Review */}
            {user && (
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Leave a Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`h-8 w-8 cursor-pointer transition ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Review</label>
                    <Textarea
                      placeholder="Share your experience with this trail..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      data-testid="textarea-review"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 10 characters ({reviewText.length}/10)
                    </p>
                  </div>
                  <Button
                    onClick={() => submitReviewMutation.mutate()}
                    disabled={submitReviewMutation.isPending || !rating || reviewText.length < 10}
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? "Posting..." : "Post Review"}
                  </Button>
                </div>
              </div>
            )}

            {/* Display Reviews */}
            <div>
              <h3 className="font-semibold mb-4">
                {reviews?.length || 0} Reviews
              </h3>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from "react";
