import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Users, Heart, Award } from "lucide-react";
import teamImage from "@assets/generated_images/Hiking_team_community_moment_c1289cf5.png";

export default function About() {
  const values = [
    {
      icon: Mountain,
      title: "Mental Wellness",
      description: "Promoting emotional healing and mental well-being through nature-based experiences.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building an inclusive, supportive space for youth to connect and grow together.",
    },
    {
      icon: Heart,
      title: "Environmental Care",
      description: "Committed to environmental conservation and responsible tourism through Umuganda.",
    },
    {
      icon: Award,
      title: "Youth Empowerment",
      description: "Empowering youth physically, mentally, and socially through hiking and mentorship.",
    },
  ];

  const team = [
    {
      name: "MPUHWE Dhurkifli",
      role: "Founder & CEO",
      bio: "Passionate about youth empowerment and nature-based healing through hiking experiences.",
    },
    {
      name: "Operations Team",
      role: "Event Coordination",
      bio: "Expert in organizing and coordinating weekly hikes across Rwanda's beautiful landscapes.",
    },
    {
      name: "Community Guides",
      role: "Trail Leadership",
      bio: "Trained guides dedicated to ensuring safe, inclusive, and transformative hiking experiences.",
    },
    {
      name: "Youth Mentors",
      role: "Peer Support",
      bio: "Young leaders committed to peer counseling, skill-building, and community connection.",
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
            A family of youth empowered through hiking, promoting physical, mental, and social wellness.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  HIGH HIKERS is a family of youth led to use hiking as a tool to empower young people physically, mentally, and socially. Founded by MPUHWE Dhurkifli on 13th June, 2025.
                </p>
                <p>
                  High Hikers was born out of a desire to create safe, inclusive and transformative outdoor experiences for youth.
                </p>
                <p>
                  We organize regular hikes across Rwanda's hills and forests while integrating dialogue, peer support and skills building into experiences. Through this unique approach, we promote self-confidence, healing and a strong connection with nature.
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
              <div className="text-4xl font-bold text-primary font-mono">15+</div>
              <div className="text-sm text-muted-foreground mt-1">Organized Hikes</div>
            </div>
            <div data-testid="stat-hikers">
              <div className="text-4xl font-bold text-primary font-mono">100+</div>
              <div className="text-sm text-muted-foreground mt-1">Youth Participants</div>
            </div>
            <div data-testid="stat-events">
              <div className="text-4xl font-bold text-primary font-mono">Weekly</div>
              <div className="text-sm text-muted-foreground mt-1">Hikes Organized</div>
            </div>
            <div data-testid="stat-years">
              <div className="text-4xl font-bold text-primary font-mono">2025</div>
              <div className="text-sm text-muted-foreground mt-1">Year Founded</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
