import { useState } from "react";
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
import { MapPin, Search, ArrowRight, Map as MapIcon, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { TrailMap } from "@/components/trail-map";
import type { Trail } from "@shared/schema";
import forestTrail from "@assets/generated_images/Forest_trail_easy_hike_8367c201.png";
import mountainRidge from "@assets/generated_images/Mountain_ridge_challenging_trail_b017c93a.png";
import alpineLake from "@assets/generated_images/Alpine_lake_moderate_trail_a28c94b8.png";
import waterfallTrail from "@assets/generated_images/Autumn_waterfall_trail_landscape_9e974262.png";

export default function Trails() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showNewTrailModal, setShowNewTrailModal] = useState(false);
  const [trailForm, setTrailForm] = useState({ name: "", location: "", difficulty: "moderate", distance: "", elevation: "", duration: "", description: "", imageUrl: "" });
  const [error, setError] = useState("");

  const { data: allTrails = [], isLoading, isError } = useQuery<Trail[]>({
    queryKey: ["/api/trails"],
  });

  const createTrailMutation = useMutation({
    mutationFn: async (data: typeof trailForm) => {
      const res = await fetch("/api/trails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      setTrailForm({ name: "", location: "", difficulty: "moderate", distance: "", elevation: "", duration: "", description: "", imageUrl: "" });
      setShowNewTrailModal(false);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const imageMap: Record<string, string> = {
    "/assets/forest-trail.jpg": forestTrail,
    "/assets/mountain-ridge.jpg": mountainRidge,
    "/assets/alpine-lake.jpg": alpineLake,
    "/assets/waterfall-trail.jpg": waterfallTrail,
    "/assets/mountain-view.jpg": alpineLake,
    "/assets/eagle-peak.jpg": mountainRidge,
  };

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

  const filteredTrails = allTrails.filter((trail) => {
    const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trail.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || trail.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Hiking Trails
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover trails for every skill level. Search by name, location, or difficulty.
            </p>
          </div>
          {user?.role === "admin" && (
            <Dialog open={showNewTrailModal} onOpenChange={setShowNewTrailModal}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> New Trail</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Trail</DialogTitle>
                </DialogHeader>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                <div className="space-y-4">
                  <Input placeholder="Trail Name" value={trailForm.name} onChange={(e) => setTrailForm({...trailForm, name: e.target.value})} />
                  <Input placeholder="Location" value={trailForm.location} onChange={(e) => setTrailForm({...trailForm, location: e.target.value})} />
                  <Select value={trailForm.difficulty} onValueChange={(v) => setTrailForm({...trailForm, difficulty: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="Distance (km)" type="number" step="0.1" value={trailForm.distance} onChange={(e) => setTrailForm({...trailForm, distance: e.target.value})} />
                  <Input placeholder="Elevation (m)" type="number" value={trailForm.elevation} onChange={(e) => setTrailForm({...trailForm, elevation: e.target.value})} />
                  <Input placeholder="Duration (hours)" type="number" step="0.1" value={trailForm.duration} onChange={(e) => setTrailForm({...trailForm, duration: e.target.value})} />
                  <Textarea placeholder="Description" value={trailForm.description} onChange={(e) => setTrailForm({...trailForm, description: e.target.value})} />
                  <Input placeholder="Image URL" value={trailForm.imageUrl} onChange={(e) => setTrailForm({...trailForm, imageUrl: e.target.value})} />
                  <Button onClick={() => createTrailMutation.mutate(trailForm)} disabled={createTrailMutation.isPending} className="w-full">
                    {createTrailMutation.isPending ? "Creating..." : "Create Trail"}
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
              placeholder="Search trails by name or location..."
              className="pl-10 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-trails"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedDifficulty === null ? "default" : "outline"}
              onClick={() => setSelectedDifficulty(null)}
              data-testid="button-filter-all"
            >
              All Trails
            </Button>
            <Button
              variant={selectedDifficulty === "easy" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("easy")}
              data-testid="button-filter-easy"
            >
              Easy
            </Button>
            <Button
              variant={selectedDifficulty === "moderate" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("moderate")}
              data-testid="button-filter-moderate"
            >
              Moderate
            </Button>
            <Button
              variant={selectedDifficulty === "hard" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("hard")}
              data-testid="button-filter-hard"
            >
              Hard
            </Button>
          </div>

          <div className="flex gap-2 justify-center border-t border-border pt-4">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              data-testid="button-view-map"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">Failed to load trails. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={`skeleton-trail-${i}`} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTrails.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-trails">
              No trails found matching your criteria. Try adjusting your search.
            </p>
          </div>
        ) : viewMode === "map" ? (
          <div className="mb-12">
            <TrailMap trails={filteredTrails} />
            <p className="text-sm text-muted-foreground text-center mt-4">
              Click on markers to view trail details. {filteredTrails.length} trail(s) shown.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrails.map((trail) => (
              <Card key={trail._id?.toString() || trail.id} className="overflow-hidden hover-elevate transition-all cursor-pointer h-full" data-testid={`card-trail-${trail._id?.toString() || trail.id}`}>
                <Link href={`/trails/${trail._id?.toString() || trail.id}`}>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={imageMap[trail.imageUrl] || forestTrail}
                    alt={trail.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className={`absolute top-3 right-3 ${getDifficultyColor(trail.difficulty)}`}
                    data-testid={`badge-difficulty-${trail.id}`}
                  >
                    {trail.difficulty}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{trail.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trail.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {trail.description}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                    <div className="text-center">
                      <div className="font-mono font-semibold text-foreground">{trail.distance}</div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-semibold text-foreground">{trail.elevation}</div>
                      <div className="text-xs text-muted-foreground">Elevation</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-semibold text-foreground">{trail.duration}</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" data-testid={`button-view-details-${trail.id}`}>
                    View Details
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
