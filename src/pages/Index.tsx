import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import CampusMap from "@/components/CampusMap";
import TimeSlider from "@/components/TimeSlider";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import DashboardHeader from "@/components/DashboardHeader";
import { CampusGeoJSON } from "@/types/campus";
import { calculateTotalCarbon, generateForecastData } from "@/lib/mockData";

const Index = () => {
  // Used to navigate from the dashboard to the insights page.
  const navigate = useNavigate();

  // Original campus data loaded from the local GeoJSON file.
  const [originalGeoJSON, setOriginalGeoJSON] = useState<CampusGeoJSON | null>(
    null,
  );

  // Campus data currently rendered on the map, including live emissions.
  const [displayGeoJSON, setDisplayGeoJSON] = useState<CampusGeoJSON | null>(
    null,
  );

  // Selected number of hours from the current time.
  const [forecastHour, setForecastHour] = useState(0);

  // Aggregated emissions across all returned buildings.
  const [totalCarbon, setTotalCarbon] = useState(0);

  // Number of buildings contained in the campus dataset.
  const [buildingCount, setBuildingCount] = useState(0);

  // Generate forecast data once when the component is created.
  const [forecastData] = useState(generateForecastData);

  // Load the campus GeoJSON when the dashboard first mounts.
  useEffect(() => {
    fetch("/campus.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load campus data");
        }

        return res.json();
      })
      .then((data: CampusGeoJSON) => {
        // Preserve an unchanged copy for future emissions updates.
        setOriginalGeoJSON(data);

        // Use the initial data for the first map render.
        setDisplayGeoJSON(data);

        // Initialize the dashboard summary values.
        setBuildingCount(data.features.length);
        setTotalCarbon(calculateTotalCarbon(data));
      })
      .catch((err) => {
        console.error("Failed to load campus data:", err);
      });
  }, []);

  // Fetch and apply emissions whenever the forecast selection changes.
  useEffect(() => {
    // Wait until the base campus data is available.
    if (!originalGeoJSON) return;

    // Convert the forecast offset into an hour of the day.
    const currentHour = new Date().getHours();
    const targetHour = (currentHour + forecastHour) % 24;

    console.log("Target hour:", targetHour);
    console.log(`http://localhost:8000/get-emissions/${targetHour}`);

    // Request emissions for the selected target hour.
    fetch(`http://localhost:8000/get-emissions/${targetHour}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch emissions");
        }

        return res.json();
      })
      .then((data) => {
        // Match each map feature with its corresponding backend result.
        const updatedFeatures = originalGeoJSON.features.map((feature) => {
          // Support both lowercase and capitalized building-name fields.
          const buildingId =
            feature.properties.name || (feature.properties as any).Name;

          const buildingData = data.results.find(
            (result: any) => result.building_id === buildingId,
          );

          // Add the latest emissions values when a match is found.
          if (buildingData) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                carbon: buildingData.total_emission,
                heatLevel: buildingData.scaled_emission,
              },
            };
          }

          // Leave unmatched buildings unchanged.
          return feature;
        });

        // Create a new GeoJSON object so React detects the state update.
        const updatedGeoJSON: CampusGeoJSON = {
          ...originalGeoJSON,
          features: updatedFeatures,
        };

        setDisplayGeoJSON(updatedGeoJSON);

        // Calculate the combined emissions returned by the backend.
        const newTotal = data.results.reduce(
          (total: number, result: any) => total + result.total_emission,
          0,
        );

        setTotalCarbon(newTotal);
      })
      .catch((err) => {
        console.error("Error fetching emissions:", err);

        // Keep the previously displayed data if the backend is unavailable.
      });
  }, [forecastHour, originalGeoJSON]);

  // Handle a user selecting a building on the campus map.
  const handleBuildingClick = useCallback((properties: any) => {
    console.log("Building clicked:", properties);
  }, []);

  // Update the selected forecast offset when the slider moves.
  const handleSliderChange = useCallback((value: number) => {
    setForecastHour(value);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Full-screen 3D campus visualization */}
      <CampusMap
        geoJSON={displayGeoJSON}
        onBuildingClick={handleBuildingClick}
      />

      {/* Dashboard title positioned in the upper-left corner */}
      <div className="absolute top-24 left-8 z-20">
        <DashboardHeader />
      </div>

      {/* Emissions summary and analytics positioned on the right */}
      <div className="absolute top-5 right-5 bottom-24 z-20 overflow-y-auto">
        <AnalyticsPanel
          totalCarbon={totalCarbon}
          buildingCount={buildingCount}
          currentHour={forecastHour}
        />
      </div>

      {/* Forecast time selector positioned at the bottom center */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-5">
        <TimeSlider
          value={forecastHour}
          onChange={handleSliderChange}
          forecastData={forecastData}
        />
      </div>

      {/* Navigation button for opening detailed recommendations */}
      <div className="absolute bottom-5 left-5 z-20">
        <button
          onClick={() => navigate("/insights")}
          className="flex items-center gap-2 px-5 py-3 glass-panel bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium hover:scale-105 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 animate-fade-in"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-display tracking-wider">GET INSIGHTS</span>
        </button>
      </div>

      {/* Decorative scanline overlay; ignores pointer interactions */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
    </div>
  );
};

export default Index;
