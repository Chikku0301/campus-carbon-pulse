import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

// ============================================================
// NAVLINK PROPS
// ============================================================

// Custom props for our reusable NavLink component.
//
// React Router's NavLink already supports className, but this
// component modifies it to provide separate classes for:
// 1. Normal state
// 2. Active route
// 3. Pending navigation
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  // CSS classes applied to the link normally
  className?: string;

  // CSS classes applied when the current route is active
  activeClassName?: string;

  // CSS classes applied while navigation is pending
  pendingClassName?: string;
}

// ============================================================
// NAVLINK COMPONENT
// ============================================================

// forwardRef allows the parent component to access the
// underlying <a> element's DOM reference.
//
// This is useful for operations such as:
// - Focusing the link
// - Measuring the element
// - Integrating with other UI components
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  // Receive the link properties and forwarded ref
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      // Use React Router's NavLink internally.
      //
      // Renaming it to RouterNavLink prevents a naming conflict
      // with our custom NavLink component.
      <RouterNavLink
        // Forward the ref to the actual anchor element
        ref={ref}
        // Destination route
        to={to}
        // React Router provides the current navigation state
        // through isActive and isPending.
        className={({ isActive, isPending }) =>
          // cn() combines CSS class names safely.
          //
          // className:
          //     Base classes
          //
          // activeClassName:
          //     Added when the link matches the current route
          //
          // pendingClassName:
          //     Added while navigation is in progress
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          )
        }
        // Pass all remaining NavLink props to React Router
        {...props}
      />
    );
  },
);

// ============================================================
// COMPONENT DISPLAY NAME
// ============================================================

// Provides a readable name for the component in
// React Developer Tools.
NavLink.displayName = "NavLink";

// Export the custom NavLink component
// so it can be reused throughout the application.
export { NavLink };
