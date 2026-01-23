import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PaymentDialog } from "@/components/payment-dialog";
import type { Event } from "@shared/schema";

export default function Events() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<{
    id: string;
    title: string;
    price: number;
    currency: string;
  } | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", location: "", difficulty: "moderate", date: "", time: "", maxParticipants: "", description: "", imageUrl: "", isPaid: false, price: "", currency: "RWF" });
  const [error, setError] = useState("");

  const { data: events = [], isLoading, isError } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof eventForm) => {
      const payload = {
        ...data,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
        price: data.price ? parseFloat(data.price) : undefined,
      };
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEventForm({ title: "", location: "", difficulty: "moderate", date: "", time: "", maxParticipants: "", description: "", imageUrl: "", isPaid: false, price: "", currency: "RWF" });
      setShowNewEventModal(false);
      setError("");
    },
    onError: (err) => setError(err.message),
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Join our community on group hikes, workshops, and outdoor adventures. All skill levels welcome!
            </p>
          </div>
          {user?.role === "admin" && (
            <Dialog open={showNewEventModal} onOpenChange={setShowNewEventModal}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> New Event</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                <div className="space-y-4">
                  <Input placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} />
                  <Input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} />
                  <Select value={eventForm.difficulty} onValueChange={(v) => setEventForm({...eventForm, difficulty: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="hard">Hard</SelectItem><SelectItem value="educational">Educational</SelectItem></SelectContent>
                  </Select>
                  <Input type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} />
                  <Input type="time" value={eventForm.time} onChange={(e) => setEventForm({...eventForm, time: e.target.value})} />
                  <Input placeholder="Max Participants" type="number" value={eventForm.maxParticipants} onChange={(e) => setEventForm({...eventForm, maxParticipants: e.target.value})} />
                  <Textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} />
                  <Input placeholder="Image URL" value={eventForm.imageUrl} onChange={(e) => setEventForm({...eventForm, imageUrl: e.target.value})} />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isPaid" checked={eventForm.isPaid} onChange={(e) => setEventForm({...eventForm, isPaid: e.target.checked})} />
                    <label htmlFor="isPaid">Paid Event</label>
                  </div>
                  {eventForm.isPaid && (
                    <>
                      <Input placeholder="Price" type="number" step="0.01" value={eventForm.price} onChange={(e) => setEventForm({...eventForm, price: e.target.value})} />
                      <Select value={eventForm.currency} onValueChange={(v) => setEventForm({...eventForm, currency: v})}>
                        <SelectTrigger aria-label="Select currency"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="RWF">RWF</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                      </Select>
                    </>
                  )}
                  <Button onClick={() => createEventMutation.mutate(eventForm)} disabled={createEventMutation.isPending} className="w-full">
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isError ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">Failed to load events. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-32 p-6">
                    <Skeleton className="h-20 w-20 mx-auto rounded-lg" />
                  </div>
                  <div className="flex-1 p-6">
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-10 w-32 mt-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const { day, month } = formatDate(event.date);
              return (
                <Card key={event.id} className="hover-elevate transition-all" data-testid={`card-event-${event.id}`}>
                <Link href={`/events/${event.id}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-32 bg-primary/10 flex flex-col items-center justify-center p-6 border-r border-card-border">
                      <Calendar className="h-8 w-8 text-primary mb-2" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {day}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {month}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-2xl">{event.title}</CardTitle>
                          <Badge className={getDifficultyColor(event.difficulty)} data-testid={`badge-difficulty-${event.id}`}>
                            {event.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        <p className="text-muted-foreground mb-4">{event.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{event.location}</span>
                          </div>
                          {event.maxParticipants && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                Max {event.maxParticipants} participants
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="default"
                          onClick={() => {
                            if (event.isPaid && event.price) {
                              setSelectedEventForPayment({
                                id: event.id?.toString() || "",
                                title: event.title,
                                price: event.price,
                                currency: event.currency || "RWF",
                              });
                            }
                          }}
                          data-testid={`button-register-${event.id}`}
                        >
                          {event.isPaid && event.price
                            ? `Register - ${event.price.toLocaleString()} ${event.currency || "RWF"}`
                            : "Register Now"}
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Link>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Want to organize your own event or suggest a new hike?
          </p>
          <Button variant="outline" size="lg" data-testid="button-suggest-event">
            Suggest an Event
          </Button>
        </div>

        <PaymentDialog
          open={!!selectedEventForPayment}
          onOpenChange={(open) => {
            if (!open) setSelectedEventForPayment(null);
          }}
          eventId={selectedEventForPayment?.id || ""}
          eventTitle={selectedEventForPayment?.title || ""}
          amount={selectedEventForPayment?.price || 0}
          currency={selectedEventForPayment?.currency || "RWF"}
          onSuccess={() => {
            // Refresh events list
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
