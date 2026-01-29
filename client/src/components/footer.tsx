import { Link } from "wouter";
import { useState } from "react";
import { Mountain, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 3000);
      } else {
        alert("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-card border-t border-card-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HIGH HIKERS</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover amazing hiking trails and connect with outdoor enthusiasts. Your next adventure starts here.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-social-facebook" onClick={() => window.open("https://facebook.com/highhikers", "_blank")}>
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-social-instagram" onClick={() => window.open("https://instagram.com/high_hikerrs", "_blank")}>
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-social-twitter" onClick={() => window.open("https://twitter.com/highhikers", "_blank")}>
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-social-youtube" onClick={() => window.open("https://youtube.com/@highhikers", "_blank")}>
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trails" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-trails">
                  Browse Trails
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-events">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-blog">
                  Blog & Tips
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: highhikers1@gmail.com</li>
              <li>Phone: +250 788565306 / 0791256980</li>
              <li>Instagram: @high_hikerrs</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe for trail updates and hiking tips.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || subscribed}
                onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <Button 
                variant="default" 
                data-testid="button-newsletter-subscribe"
                onClick={handleSubscribe}
                disabled={isLoading || subscribed}
              >
                {subscribed ? "✓ Subscribed!" : isLoading ? "..." : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HIGH HIKERS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
