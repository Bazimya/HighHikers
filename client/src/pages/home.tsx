import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MapPin, TrendingUp, Clock, Mountain } from "lucide-react";
import type { Trail } from "@shared/schema";
import heroImage from "@assets/generated_images/Hero_mountain_sunrise_landscape_2817734b.png";
import forestTrail from "@assets/generated_images/Forest_trail_easy_hike_8367c201.png";
import mountainRidge from "@assets/generated_images/Mountain_ridge_challenging_trail_b017c93a.png";
import alpineLake from "@assets/generated_images/Alpine_lake_moderate_trail_a28c94b8.png";

export default function Home() {
  const { data: trails, isLoading, isError } = useQuery<Trail[]>({
    queryKey: ["/api/trails"],
  });

  const imageMap: Record<string, string> = {
    "/assets/forest-trail.jpg": forestTrail,
    "/assets/mountain-ridge.jpg": mountainRidge,
    "/assets/alpine-lake.jpg": alpineLake,
  };

  const featuredTrails = trails?.filter((t) => t.featured === 1).slice(0, 3) || [];

  const stats = [
    { label: "Organized Hikes", value: "15+", icon: Mountain },
    { label: "Youth Participants", value: "100+", icon: TrendingUp },
    { label: "Hikes/Week", value: "Weekly", icon: Clock },
    { label: "Locations", value: "Rwanda", icon: MapPin },
  ];

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

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Explore breathtaking hiking trails, connect with outdoor enthusiasts, and experience the beauty of nature.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trails">
              <Button
                size="lg"
                variant="default"
                className="text-lg px-8 py-6"
                data-testid="button-hero-explore"
              >
                Explore Trails
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                data-testid="button-hero-events"
              >
                Join Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Trails
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked trails for every skill level. From peaceful forest walks to challenging mountain climbs.
            </p>
          </div>

          {isError ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Unable to load featured trails at this time.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTrails.map((trail) => (
                <Card key={trail.id} className="overflow-hidden hover-elevate transition-all" data-testid={`card-trail-${trail.id}`}>
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
                    <Link href="/trails">
                      <Button variant="outline" className="w-full" data-testid={`button-view-trail-${trail.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/trails">
              <Button size="lg" variant="default" data-testid="button-view-all-trails">
                View All Trails
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of hikers discovering new trails and creating unforgettable memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" variant="default" data-testid="button-cta-join">
                Join Our Community
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" data-testid="button-cta-contact">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
