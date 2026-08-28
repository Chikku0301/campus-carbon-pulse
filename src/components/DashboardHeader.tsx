import { useNavigate } from "react-router-dom";

// Header component for the Campus Twin dashboard
const DashboardHeader = () => {
  // useNavigate allows the component to navigate
  // programmatically between different routes/pages.
  const navigate = useNavigate();

  return (
    // Main header container
    // glass-panel provides the glassmorphism-style UI
    // p-4 adds padding
    // animate-fade-in adds a fade-in animation
    <div className="glass-panel p-4 pl-6 animate-fade-in">
      {/* 
        Main header content.
        justify-between keeps the left and right sections
        separated if additional elements are added later.
      */}
      <div className="flex items-center justify-between">
        {/* 
          Left section containing:
          1. University logo
          2. Application title
          3. Application description
        */}
        <div className="flex items-center gap-4">
          {/* University Logo */}
          <img
            src="/ShivNadarUniversityLogo.avif"
            alt="Shiv Nadar University"
            // Set logo height while maintaining its aspect ratio
            className="h-12 w-auto object-contain"
          />

          {/* 
            Vertical divider between the university logo
            and the application information.
          */}
          <div className="border-l border-border/30 pl-4">
            {/* 
              Main application title.
              font-display -> custom display font
              text-xl -> large text
              font-black -> extra bold
              tracking-wider -> increased letter spacing
              cyber-text -> custom cyber/ futuristic text styling
            */}
            <h1 className="font-display text-xl font-black tracking-wider cyber-text">
              CAMPUS TWIN
            </h1>

            {/* Application description */}
            <p className="text-[11px] text-muted-foreground tracking-wide">
              Digital Carbon Footprint Monitor
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          SYSTEM STATUS SECTION
          ============================================================ */}

      {/* 
        Displays the current system status and
        the most recent data synchronization time.
      */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
        {/* 
          Small circular indicator showing that the
          system is currently online.

          animate-pulse makes the indicator continuously pulse.
        */}
        <div className="w-2 h-2 rounded-full bg-carbon-low animate-pulse" />

        {/* System status text */}
        <span className="text-[10px] text-muted-foreground">System Online</span>

        {/* 
          Last synchronization information.

          ml-auto pushes this text to the far right
          of the header.
        */}
        <span className="text-[10px] text-muted-foreground ml-auto">
          Last sync: Just now
        </span>
      </div>
    </div>
  );
};

// Export the DashboardHeader component
// so it can be imported and used in other components.
export default DashboardHeader;
