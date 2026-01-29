import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus, Edit2, Trash2, Users, Mountain, Calendar, FileText } from "lucide-react";
import type { TrailType, EventType, BlogPostType, UserType } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trails");
  const [error, setError] = useState("");
  const [showNewTrailModal, setShowNewTrailModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  
  // Form states
  const [trailForm, setTrailForm] = useState({ name: "", location: "", difficulty: "medium", distance: "", elevation: "", duration: "", description: "", imageUrl: "" });
  const [eventForm, setEventForm] = useState({ title: "", location: "", difficulty: "medium", date: "", time: "", maxParticipants: "", description: "", imageUrl: "", isPaid: false, price: "", currency: "RWF" });
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", content: "", category: "", author: "", imageUrl: "" });

  // Redirect if not admin
  if (!user?.role || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Fetch data
  const { data: trails } = useQuery<TrailType[]>({
    queryKey: ["/api/trails"],
  });
  const { data: events } = useQuery<EventType[]>({
    queryKey: ["/api/events"],
  });

  const { data: blogs } = useQuery<BlogPostType[]>({
    queryKey: ["/api/blog"],
  });

  const { data: users } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/contact/messages"],
  });

  // Create mutations
  const createTrailMutation = useMutation({
    mutationFn: async (data: typeof trailForm) => {
      console.log("[Admin] Trail form data:", data);
      const res = await fetch("/api/trails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("[Admin] Trail creation response status:", res.status);
      if (!res.ok) {
        const error = await res.json();
        console.error("[Admin] Trail creation error:", error);
        throw new Error(error.details ? JSON.stringify(error.details) : error.error || "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Trail created!", description: "Your new trail has been added successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      setTrailForm({ name: "", location: "", difficulty: "medium", distance: "", elevation: "", duration: "", description: "", imageUrl: "" });
      setShowNewTrailModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof eventForm) => {
      console.log("[Admin] Event form data:", data);
      
      // Validate required fields
      if (!data.title || !data.location || !data.date || !data.time) {
        throw new Error("Please fill in all required fields: title, location, date, and time");
      }
      
      const payload = {
        ...data,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
        price: data.price ? parseFloat(data.price) : undefined,
      };
      console.log("[Admin] Sending payload:", payload);
      
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details ? JSON.stringify(error.details) : error.error || "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Event created!", description: "Your new event has been added successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEventForm({ title: "", location: "", difficulty: "medium", date: "", time: "", maxParticipants: "", description: "", imageUrl: "", isPaid: false, price: "", currency: "RWF" });
      setShowNewEventModal(false);
    },
    onError: (err) => {
      toast({ title: "❌ Event creation failed", description: err.message, variant: "destructive" });
      setError(err.message);
    },
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: typeof blogForm) => {
      console.log("[Admin] Blog form data:", data);
      const res = await fetch("/api/blog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("[Admin] Blog creation response status:", res.status);
      if (!res.ok) {
        const error = await res.json();
        console.error("[Admin] Blog creation error:", error);
        throw new Error(error.details ? JSON.stringify(error.details) : error.error || "Create failed");
      }
      const result = await res.json();
      console.log("[Admin] Blog created successfully:", result);
      return result;
    },
    onSuccess: () => {
      toast({ title: "✅ Blog post created!", description: "Your new blog post has been published successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setBlogForm({ title: "", excerpt: "", content: "", category: "", author: "", imageUrl: "" });
      setShowNewBlogModal(false);
    },
    onError: (err) => {
      toast({ title: "❌ Blog creation failed", description: err.message, variant: "destructive" });
      console.error("[Admin] Blog mutation error:", err);
      setError(err.message);
    },
  });

  // Delete mutations
  const deleteTrailMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trails/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your hiking platform</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trails">
              <Mountain className="h-4 w-4 mr-2" />
              Trails
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="blog">
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* TRAILS TAB */}
          <TabsContent value="trails">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Trails Management</h2>
                <Dialog open={showNewTrailModal} onOpenChange={setShowNewTrailModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Trail
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Trail</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Trail name"
                        value={trailForm.name}
                        onChange={(e) => setTrailForm({ ...trailForm, name: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={trailForm.location}
                        onChange={(e) => setTrailForm({ ...trailForm, location: e.target.value })}
                      />
                      <select
                        aria-label="Difficulty level"
                        value={trailForm.difficulty}
                        onChange={(e) => setTrailForm({ ...trailForm, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <Input
                        placeholder="Distance (km)"
                        type="number"
                        value={trailForm.distance}
                        onChange={(e) => setTrailForm({ ...trailForm, distance: e.target.value })}
                      />
                      <Input
                        placeholder="Elevation gain (m)"
                        type="number"
                        value={trailForm.elevation}
                        onChange={(e) => setTrailForm({ ...trailForm, elevation: e.target.value })}
                      />
                      <Input
                        placeholder="Duration (e.g., 3 hours)"
                        value={trailForm.duration}
                        onChange={(e) => setTrailForm({ ...trailForm, duration: e.target.value })}
                      />
                      <Input
                        placeholder="Image URL"
                        value={trailForm.imageUrl}
                        onChange={(e) => setTrailForm({ ...trailForm, imageUrl: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={trailForm.description}
                        onChange={(e) => setTrailForm({ ...trailForm, description: e.target.value })}
                      />
                      <Button onClick={() => createTrailMutation.mutate(trailForm)} disabled={createTrailMutation.isPending}>
                        {createTrailMutation.isPending ? "Creating..." : "Create Trail"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {trails?.map((trail) => (
                  <Card key={trail._id?.toString() || trail.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{trail.name}</h3>
                          <p className="text-sm text-muted-foreground">{trail.location}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Difficulty: {trail.difficulty}</span>
                            <span>Distance: {trail.distance}</span>
                            <span>Elevation: {trail.elevation}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTrailMutation.mutate(trail.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Events Management</h2>
                <Dialog open={showNewEventModal} onOpenChange={setShowNewEventModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Event title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      />
                      <select
                        aria-label="Difficulty level"
                        value={eventForm.difficulty}
                        onChange={(e) => setEventForm({ ...eventForm, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <Input
                        placeholder="Date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      />
                      <Input
                        placeholder="Time"
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      />
                      <Input
                        placeholder="Max participants"
                        type="number"
                        value={eventForm.maxParticipants}
                        onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                      />
                      <Input
                        placeholder="Image URL"
                        value={eventForm.imageUrl}
                        onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      />
                      
                      {/* Payment Section */}
                      <div className="border-t pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventForm.isPaid}
                            onChange={(e) => setEventForm({ ...eventForm, isPaid: e.target.checked })}
                          />
                          <span className="text-sm font-medium">This is a paid event</span>
                        </label>
                      </div>
                      
                      {eventForm.isPaid && (
                        <>
                          <Input
                            placeholder="Price"
                            type="number"
                            value={eventForm.price}
                            onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                          />
                          <select
                            aria-label="Currency"
                            value={eventForm.currency}
                            onChange={(e) => setEventForm({ ...eventForm, currency: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                          >
                            <option value="RWF">RWF (Rwandan Franc)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="EUR">EUR (Euro)</option>
                          </select>
                        </>
                      )}
                      
                      <Button onClick={() => createEventMutation.mutate(eventForm)} disabled={createEventMutation.isPending}>
                        {createEventMutation.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {events?.map((event) => (
                  <Card key={event._id?.toString()}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Date: {event.date}</span>
                            <span>Difficulty: {event.difficulty}</span>
                            <span>
                              Participants: {event.currentParticipants || 0}
                              {event.maxParticipants ? `/${event.maxParticipants}` : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event._id?.toString() || "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* BLOG TAB */}
          <TabsContent value="blog">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Blog Management</h2>
                <Dialog open={showNewBlogModal} onOpenChange={setShowNewBlogModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Blog Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {blogs && blogs.length > 0 && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm font-semibold mb-2">Existing Posts:</p>
                          <div className="flex flex-wrap gap-2">
                            {blogs.map((post) => (
                              <span key={post._id?.toString() || post.id} className="text-xs bg-background px-2 py-1 rounded border">
                                {post.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Input
                        placeholder="Post title"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      />
                      <Input
                        placeholder="Excerpt"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      />
                      <Textarea
                        placeholder="Content"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="min-h-[100px]"
                      />
                      <Input
                        placeholder="Category"
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      />
                      <Input
                        placeholder="Author"
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                      />
                      <Input
                        placeholder="Image URL"
                        value={blogForm.imageUrl}
                        onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                      />
                      <Button onClick={() => createBlogMutation.mutate(blogForm)} disabled={createBlogMutation.isPending}>
                        {createBlogMutation.isPending ? "Creating..." : "Create Post"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {blogs?.map((post) => (
                  <Card key={post._id?.toString() || post.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Category: {post.category}</span>
                            <span>Author: {typeof post.author === "string" ? post.author : post.author?.username || "Anonymous"}</span>
                            <span>Published: {post.publishedAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteBlogMutation.mutate(post._id?.toString() || "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Users Management</h2>

              <div className="grid gap-4">
                {users?.map((u) => (
                  <Card key={u._id?.toString() || u.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            {u.firstName} {u.lastName || u.username}
                          </h3>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {u.role}
                          </span>
                        </div>
                        <div>
                          <select
                            aria-label="User role"
                            value={u.role || "user"}
                            onChange={(e) =>
                              updateUserRoleMutation.mutate({ userId: u.id, role: e.target.value })
                            }
                            className="px-3 py-2 border border-border rounded-md text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Messages</h2>

              <div className="grid gap-4">
                {messages?.map((msg: any) => (
                  <Card key={msg._id?.toString() || msg.id}>
                    <CardContent className="pt-6">
                      <div>
                        <h3 className="font-semibold">{msg.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {msg.name} ({msg.email})
                        </p>
                        <p className="mt-2 text-sm">{msg.message}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            Status: {msg.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
