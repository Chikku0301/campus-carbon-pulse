import { LucideIcon } from "lucide-react";

// ============================================================
// DATA INTERFACES
// ============================================================

// Represents a single insight displayed inside the card
interface InsightItem {
  // Title of the insight
  title: string;

  // Detailed explanation of the insight
  description: string;

  // Optional numerical or textual value associated with the insight
  value?: string;

  // Optional recommendation or impact statement
  impact?: string;
}

// Props required by the InsightCard component
interface InsightCardProps {
  // Lucide icon displayed at the top of the card
  icon: LucideIcon;

  // Main heading of the insight card
  title: string;

  // List of insights to display inside the card
  items: InsightItem[];

  // Determines the visual theme/color of the card
  type: "peak_hours" | "buildings" | "trends" | "recommendations";
}

// ============================================================
// INSIGHT CARD COMPONENT
// ============================================================

const InsightCard = ({ icon: Icon, title, items, type }: InsightCardProps) => {
  // ========================================================
  // GET CARD GRADIENT
  // ========================================================

  // Returns different gradient and border classes
  // depending on the type of insight card.
  const getGradientClass = () => {
    switch (type) {
      // Peak-hour insights use an orange/red theme
      case "peak_hours":
        return "from-orange-500/20 to-red-500/20 border-orange-500/30";

      // Building-related insights use a blue/cyan theme
      case "buildings":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";

      // Trend-related insights use a purple/pink theme
      case "trends":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30";

      // Recommendation insights use a green/emerald theme
      case "recommendations":
        return "from-green-500/20 to-emerald-500/20 border-green-500/30";

      // Default theme if an unexpected type is provided
      default:
        return "from-primary/20 to-secondary/20 border-primary/30";
    }
  };

  // ========================================================
  // GET ICON COLOR
  // ========================================================

  // Returns the icon/text color based on the card type.
  const getIconColor = () => {
    switch (type) {
      // Orange icon for peak-hour insights
      case "peak_hours":
        return "text-orange-400";

      // Blue icon for building insights
      case "buildings":
        return "text-blue-400";

      // Purple icon for trend insights
      case "trends":
        return "text-purple-400";

      // Green icon for recommendations
      case "recommendations":
        return "text-green-400";

      // Default primary color
      default:
        return "text-primary";
    }
  };

  // ========================================================
  // COMPONENT UI
  // ========================================================

  return (
    // Main insight card
    //
    // glass-panel:
    //     Gives the card a glassmorphism appearance.
    //
    // bg-gradient-to-br:
    //     Creates a diagonal background gradient.
    //
    // getGradientClass():
    //     Dynamically selects the gradient based on type.
    //
    // animate-fade-in:
    //     Adds a fade-in animation.
    //
    // hover:scale-[1.02]:
    //     Slightly enlarges the card when hovered.
    //
    // transition-transform:
    //     Makes the hover animation smooth.
    <div
      className={`
                glass-panel
                p-6
                bg-gradient-to-br
                ${getGradientClass()}
                border
                animate-fade-in
                hover:scale-[1.02]
                transition-transform
                duration-300
            `}
    >
      {/* ==================================================
                CARD HEADER
                ================================================== */}

      <div className="flex items-center gap-3 mb-4">
        {/* 
                    Icon container.

                    The icon color is dynamically selected based
                    on the type of insight card.
                */}
        <div
          className={`
                        w-10
                        h-10
                        rounded-lg
                        bg-background/50
                        flex
                        items-center
                        justify-center
                        ${getIconColor()}
                    `}
        >
          {/* 
                        Render the Lucide icon passed through props.

                        Icon is an alias for the "icon" prop,
                        allowing us to use it as a React component.
                    */}
          <Icon className="w-5 h-5" />
        </div>

        {/* Insight card title */}
        <h3 className="font-display text-lg font-bold tracking-wide">
          {title}
        </h3>
      </div>

      {/* ==================================================
                INSIGHT ITEMS
                ================================================== */}

      <div className="space-y-4">
        {/* 
                    Loop through every insight item and
                    generate an individual insight box.
                */}
        {items.map((item, index) => (
          <div
            key={index}
            className="
                            p-4
                            rounded-lg
                            bg-background/30
                            backdrop-blur-sm
                            border
                            border-border/20
                            hover:border-border/40
                            transition-colors
                        "
          >
            {/* ======================================
                            ITEM TITLE AND VALUE
                            ====================================== */}

            <div className="flex items-start justify-between gap-3 mb-2">
              {/* Insight item title */}
              <h4 className="font-semibold text-sm">{item.title}</h4>

              {/* 
                                Display the value only if it exists.

                                Example:
                                "85%"
                                "12 kg/h"
                                "3.5 hours"
                            */}
              {item.value && (
                <span
                  className={`
                                        text-xs
                                        font-mono
                                        px-2
                                        py-1
                                        rounded
                                        ${getIconColor()}
                                        bg-background/50
                                    `}
                >
                  {item.value}
                </span>
              )}
            </div>

            {/* ======================================
                            ITEM DESCRIPTION
                            ====================================== */}

            {/* Detailed explanation of the insight */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {/* ======================================
                            IMPACT / RECOMMENDATION
                            ====================================== */}

            {/* 
                            Display the impact section only when
                            an impact value is provided.
                        */}
            {item.impact && (
              <div className="mt-2 pt-2 border-t border-border/20">
                {/* 
                                    💡 indicates that this text
                                    represents a recommendation,
                                    impact, or useful action.
                                */}
                <p className="text-xs text-green-400 font-medium">
                  💡 {item.impact}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the component so it can be reused
// throughout the Campus Twin dashboard.
export default InsightCard;
