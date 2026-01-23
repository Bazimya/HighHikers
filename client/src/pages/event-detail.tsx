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
import { Calendar, Clock, MapPin, Users, Star, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { useState } from "react";
import { PaymentDialog } from "@/components/payment-dialog";
import type { EventType } from "@shared/schema";
import waterfallTrail from "@assets/generated_images/Autumn_waterfall_trail_landscape_9e974262.png";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const { data: event, isLoading, isError } = useQuery<EventType>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: [`/api/events/${id}/reviews`],
    enabled: !!id,
  });

  const { data: isRegistered = false } = useQuery<boolean>({
    queryKey: [`/api/user/event-registrations/${id}`],
    enabled: !!id && !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${id}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Registered!", description: "You're registered for this event" });
      queryClient.invalidateQueries({ queryKey: [`/api/user/event-registrations`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to register", variant: "destructive" });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${id}/unregister`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Unregister failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Unregistered", description: "You've been removed from this event" });
      queryClient.invalidateQueries({ queryKey: [`/api/user/event-registrations`] });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${id}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText }),
      });
      if (!res.ok) throw new Error("Review submission failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Review posted!", description: "Thank you for your feedback" });
      setRating(0);
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/reviews`] });
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
      case "educational":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
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
            <AlertDescription>Event not found</AlertDescription>
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
        </div>
      </div>
    );
  }

  if (!event) return null;

  const spotsRemaining = event.maxParticipants ? event.maxParticipants - (event.currentParticipants || 0) : null;
  const isFull = spotsRemaining !== null && spotsRemaining <= 0;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          <img
            src={event.imageUrl || waterfallTrail}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={getDifficultyColor(event.difficulty)}>
              {event.difficulty}
            </Badge>
            {isFull && (
              <Badge variant="destructive">Event Full</Badge>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-5 w-5" />
            <span>{event.location}</span>
          </div>

          {/* Rating */}
          {event.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(event.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="font-semibold">{event.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({event.reviewCount} reviews)</span>
            </div>
          )}

          {/* Event Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Date
              </div>
              <div className="text-lg font-bold">{new Date(event.date).toLocaleDateString()}</div>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" /> Time
              </div>
              <div className="text-lg font-bold">{event.time}</div>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" /> Participants
              </div>
              <div className="text-lg font-bold">
                {event.currentParticipants || 0}
                {event.maxParticipants ? `/${event.maxParticipants}` : "+"}
              </div>
            </div>
            {event.isPaid && (
              <div className="bg-card p-4 rounded-lg">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Price
                </div>
                <div className="text-lg font-bold">{event.price?.toLocaleString()} {event.currency || 'RWF'}</div>
              </div>
            )}
          </div>

          {/* Register Button */}
          {user && (
            <div className="flex gap-2">
              {isRegistered ? (
                <>
                  <Button disabled size="lg">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Registered for this event
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => unregisterMutation.mutate()}
                    disabled={unregisterMutation.isPending}
                    data-testid="button-unregister-event"
                  >
                    Unregister
                  </Button>
                </>
              ) : isFull ? (
                <Button disabled size="lg">
                  Event is Full
                </Button>
              ) : event.isPaid && event.price ? (
                <Button
                  onClick={() => setShowPayment(true)}
                  size="lg"
                  data-testid="button-register-paid"
                >
                  Register - {event.price.toLocaleString()} {event.currency || 'RWF'}
                </Button>
              ) : (
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  size="lg"
                  data-testid="button-register-free"
                >
                  Register Now
                </Button>
              )}
            </div>
          )}

          {!user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to register for this event
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About this Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reviews & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Write Review */}
            {user && isRegistered && (
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Share Your Experience</h3>
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
                    <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                    <Textarea
                      placeholder="How was your experience at this event?"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={() => submitReviewMutation.mutate()}
                    disabled={submitReviewMutation.isPending || !rating || !reviewText}
                  >
                    {submitReviewMutation.isPending ? "Posting..." : "Post Review"}
                  </Button>
                </div>
              </div>
            )}

            {/* Display Reviews */}
            <div>
              <h3 className="font-semibold mb-4">{reviews?.length || 0} Reviews</h3>
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
                <p className="text-muted-foreground">No reviews yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        {event.isPaid && event.price && (
          <PaymentDialog
            open={showPayment}
            onOpenChange={setShowPayment}
            eventId={id!}
            eventTitle={event.title}
            amount={event.price}
            currency={event.currency || "RWF"}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
            }}
          />
        )}
      </div>
    </div>
  );
}
