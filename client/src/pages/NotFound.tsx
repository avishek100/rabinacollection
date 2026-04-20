import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Error</p>
        <h1 className="mb-3 text-5xl font-heading">404</h1>
        <p className="mb-6 text-muted-foreground">The page you are looking for does not exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">Go to Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
