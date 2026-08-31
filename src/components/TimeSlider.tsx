import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";

// Props used to control the selected forecast hour.
interface TimeSliderProps {
  // Number of hours from the current time (0–23).
  value: number;

  // Called whenever the user selects a different hour.
  onChange: (value: number) => void;

  // Optional hourly carbon forecast data.
  // Reserved for displaying data-driven slider visuals.
  forecastData?: { hour: number; carbon: number }[];
}

const TimeSlider = ({ value, onChange, forecastData }: TimeSliderProps) => {
  // Capture the current hour as the starting point of the forecast.
  const now = new Date();
  const currentHour = now.getHours();

  // Convert an hour offset into a 12-hour clock label.
  const formatTime = (hoursFromNow: number): string => {
    // Wrap values after midnight back to the beginning of the day.
    const hour = (currentHour + hoursFromNow) % 24;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:00 ${ampm}`;
  };

  // Return a compact label for the selected forecast offset.
  const getLabel = (hoursFromNow: number): string => {
    if (hoursFromNow === 0) return "Now";
    return `+${hoursFromNow}h`;
  };

  return (
    <div className="glass-panel p-4 w-full max-w-2xl mx-auto">
      {/* Forecast title and currently selected time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Decorative clock icon */}
          <Clock className="w-4 h-4 text-primary" />

          <span className="font-display text-xs tracking-wider text-muted-foreground">
            24-HOUR FORECAST
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Relative offset, such as "Now" or "+6h" */}
          <span className="text-xs text-muted-foreground">
            {getLabel(value)}
          </span>

          {/* Corresponding local clock time */}
          <span className="font-display text-sm font-bold text-foreground">
            {formatTime(value)}
          </span>
        </div>
      </div>

      {/* Slider track and visual background */}
      <div className="relative">
        {/* Heat-style background displayed underneath the slider track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full heat-bar opacity-30" />

        {/* Controlled slider representing each hour in the forecast */}
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={0}
          max={23}
          step={1}
          className="relative z-10"
        />
      </div>

      {/* Reference labels distributed across the 24-hour range */}
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>Now</span>
        <span>+6h</span>
        <span>+12h</span>
        <span>+18h</span>
        <span>+23h</span>
      </div>
    </div>
  );
};

export default TimeSlider;
