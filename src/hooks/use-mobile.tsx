import * as React from "react";

/** Viewport width below which the application uses its mobile layout. */
const MOBILE_BREAKPOINT = 768;

/**
 * Determines whether the current viewport is narrower than the mobile breakpoint.
 *
 * The hook listens for viewport changes and updates the result automatically.
 *
 * @returns `true` when the viewport width is less than 768 pixels.
 */
export function useIsMobile(): boolean {
  // Remains undefined until the viewport is checked in the browser.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Match viewports up to 767px, immediately below the desktop breakpoint.
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    // Recalculate the mobile state whenever the media query match changes.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mediaQuery.addEventListener("change", onChange);

    // Set the initial value after the component mounts in the browser.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Remove the listener when the component unmounts.
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  // Treat the initial undefined state as false during SSR and initial rendering.
  return !!isMobile;
}
