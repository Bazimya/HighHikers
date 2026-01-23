import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Users, Heart, Award } from "lucide-react";
import teamImage from "@assets/generated_images/Hiking_team_community_moment_c1289cf5.png";

export default function About() {
  const values = [
    {
      icon: Mountain,
      title: "Outdoor Adventure",
      description: "We believe in the transformative power of nature and outdoor exploration.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building connections between hikers and fostering a supportive community.",
    },
    {
      icon: Heart,
      title: "Environmental Care",
      description: "Committed to preserving trails and protecting our natural environments.",
    },
    {
      icon: Award,
      title: "Safety & Education",
      description: "Empowering hikers with knowledge and skills for safe outdoor experiences.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & Lead Guide",
      bio: "15 years of hiking experience across 30+ national parks.",
    },
    {
      name: "Mike Chen",
      role: "Trail Coordinator",
      bio: "Expert in trail maintenance and outdoor navigation.",
    },
    {
      name: "Emma Wilson",
      role: "Community Manager",
      bio: "Passionate about connecting hikers and building community.",
    },
    {
      name: "David Park",
      role: "Safety Instructor",
      bio: "Certified wilderness first responder and survival expert.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About HIGH HIKERS
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            We're a community of outdoor enthusiasts dedicated to helping people discover the joy of hiking and connecting with nature.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, HIGH HIKERS started with a simple goal: make hiking accessible and enjoyable for everyone, regardless of experience level.
                </p>
                <p>
                  We believe that time spent in nature enriches our lives, strengthens our communities, and helps us appreciate the natural world around us.
                </p>
                <p>
                  Through guided hikes, educational workshops, and our supportive community, we've helped thousands of people discover their love for the outdoors.
                </p>
                <p>
                  Whether you're taking your first steps on a forest trail or summiting your tenth peak, we're here to support your journey.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src={teamImage}
                alt="HIGH HIKERS Team"
                className="rounded-xl w-full h-auto shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover-elevate transition-all" data-testid={`card-value-${index}`}>
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced guides and outdoor enthusiasts passionate about sharing the trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover-elevate transition-all" data-testid={`card-team-${index}`}>
                <CardContent className="p-0">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div data-testid="stat-trails">
              <div className="text-4xl font-bold text-primary font-mono">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Trails Mapped</div>
            </div>
            <div data-testid="stat-hikers">
              <div className="text-4xl font-bold text-primary font-mono">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Hikers</div>
            </div>
            <div data-testid="stat-events">
              <div className="text-4xl font-bold text-primary font-mono">200+</div>
              <div className="text-sm text-muted-foreground mt-1">Events Yearly</div>
            </div>
            <div data-testid="stat-years">
              <div className="text-4xl font-bold text-primary font-mono">5+</div>
              <div className="text-sm text-muted-foreground mt-1">Years Running</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
