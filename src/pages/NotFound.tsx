import { useLocation, Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Check if URL was incorrectly encoded (e.g., %3F instead of ?)
    if (location.pathname.includes('%3F') || location.pathname.includes('%3f')) {
      // Decode and redirect to correct URL
      const decodedPath = decodeURIComponent(location.pathname);
      const [path, queryString] = decodedPath.split('?');
      if (queryString) {
        window.location.href = `${path || '/'}?${queryString}`;
      }
    }
  }, [location.pathname]);

  return (
    <>
      <Seo title="Page not found — GTM Factory" description="The page you are looking for doesn't exist." path="/404" />
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Página no encontrada</p>
        <Link to="/" className="text-primary underline hover:text-primary/80">
          Volver al inicio
        </Link>
      </div>
    </div>
    </>
  );
};

export default NotFound;
