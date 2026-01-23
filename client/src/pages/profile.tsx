import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import type { TrailRegistration, EventRegistration } from "@shared/schema";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
  });

  const { data: trailRegistrations } = useQuery<TrailRegistration[]>({
    queryKey: ["/api/user/trail-registrations"],
    enabled: !!user,
  });

  const { data: eventRegistrations } = useQuery<EventRegistration[]>({
    queryKey: ["/api/user/event-registrations"],
    enabled: !!user,
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Profile Info</TabsTrigger>
            <TabsTrigger value="trails">Trail Registrations</TabsTrigger>
            <TabsTrigger value="events">Event Registrations</TabsTrigger>
          </TabsList>

          {/* PROFILE INFO */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4 pb-6 border-b">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user.firstName} {user.lastName || user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">First Name</label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Name</label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">Save Changes</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              firstName: user.firstName || "",
                              lastName: user.lastName || "",
                              bio: user.bio || "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Username
                        </label>
                        <p className="text-foreground">{user.username}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-foreground">{user.email}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="text-foreground">{user.bio || "No bio yet"}</p>
                      </div>

                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRAIL REGISTRATIONS */}
          <TabsContent value="trails">
            <Card>
              <CardHeader>
                <CardTitle>Registered Trails</CardTitle>
              </CardHeader>
              <CardContent>
                {trailRegistrations?.length === 0 ? (
                  <p className="text-muted-foreground">You haven't registered for any trails yet.</p>
                ) : (
                  <div className="space-y-4">
                    {trailRegistrations?.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">Trail ID: {reg.trailId.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Registered: {new Date(reg.registeredAt!).toLocaleDateString()}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize">
                            {reg.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVENT REGISTRATIONS */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Registered Events</CardTitle>
              </CardHeader>
              <CardContent>
                {eventRegistrations?.length === 0 ? (
                  <p className="text-muted-foreground">You haven't registered for any events yet.</p>
                ) : (
                  <div className="space-y-4">
                    {eventRegistrations?.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">Event ID: {reg.eventId.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Registered: {new Date(reg.registeredAt!).toLocaleDateString()}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize">
                            {reg.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
