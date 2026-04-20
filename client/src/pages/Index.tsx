import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import collectionBanner from "@/assets/collection-banner.jpg";
import { getProducts, subscribeToNewsletter } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const newsletterMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: (response) => {
      setNewsletterEmail("");
      toast({
        title: "Subscribed",
        description: response.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const products = data?.items || [];
  const newArrivals = products.filter((product) => product.badge === "New Arrival");
  const bestSellers = products.filter((product) => product.badge === "Best Seller");

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    newsletterMutation.mutate({ email: newsletterEmail });
  };

  return (
    <main>
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <img src={heroBanner} alt="Rabina Closet fashion" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-foreground/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl animate-fade-in-up">
            <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/80 mb-4">New Collection 2026</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-primary-foreground leading-tight mb-6">
              Style That
              <br />
              Speaks You
            </h1>
            <p className="text-primary-foreground/80 mb-8 max-w-md">
              Discover curated fashion pieces that celebrate your unique elegance.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-background text-foreground hover:bg-background/90 px-8">
                <Link to="/shop">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground px-8">
                <Link to="/shop">
                  Explore <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Fresh Picks</p>
          <h2 className="text-3xl sm:text-4xl font-heading">New Arrivals</h2>
        </div>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading new arrivals...</p>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">We could not load products right now.</p>
        ) : newArrivals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="font-medium">No new arrivals yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check out the full collection while we prepare fresh drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="px-8">
            <Link to="/shop">View All Products</Link>
          </Button>
        </div>
      </section>

      <section className="relative h-80 sm:h-96 flex items-center justify-center overflow-hidden">
        <img src={collectionBanner} alt="Collection" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1200} height={600} />
        <div className="absolute inset-0 bg-foreground/35" />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading text-primary-foreground mb-4">The Essentials Edit</h2>
          <Button asChild className="bg-background text-foreground hover:bg-background/90">
            <Link to="/shop">Shop the Collection</Link>
          </Button>
        </div>
      </section>

      <section className="section-padding max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Customer Favorites</p>
          <h2 className="text-3xl sm:text-4xl font-heading">Best Sellers</h2>
        </div>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading best sellers...</p>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">We could not load products right now.</p>
        ) : bestSellers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="font-medium">Best sellers are coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">Explore all products to find your favorites now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-warm section-padding">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-heading mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground text-sm mb-6">Get updates on new arrivals and exclusive offers.</p>
          <form className="flex flex-col sm:flex-row gap-2 text-left" onSubmit={handleNewsletterSubmit}>
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                id="newsletter-email"
                required
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button type="submit" className="sm:self-end" disabled={newsletterMutation.isPending}>
              {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Index;
