import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  // Access information about the current unmatched route.
  const location = useLocation();

  // Log the invalid path whenever the requested location changes.
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    // Center the 404 message vertically and horizontally.
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        {/* HTTP status code */}
        <h1 className="mb-4 text-4xl font-bold">404</h1>

        {/* User-friendly error description */}
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>

        {/* Use client-side navigation to return to the dashboard */}
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
