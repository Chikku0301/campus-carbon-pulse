import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CampusGeoJSON } from "@/types/campus";

// Props accepted by the CampusMap component
interface CampusMapProps {
  // GeoJSON data containing campus building information
  geoJSON: CampusGeoJSON | null;

  // Optional callback function triggered when a building is clicked
  onBuildingClick?: (properties: any) => void;
}

// Main CampusMap component
const CampusMap = ({ geoJSON, onBuildingClick }: CampusMapProps) => {
  // Reference to the HTML div where the MapLibre map will be rendered
  const mapContainer = useRef<HTMLDivElement>(null);

  // Reference to the MapLibre map instance
  // useRef is used so that the map instance persists between renders
  const map = useRef<maplibregl.Map | null>(null);

  // Reference to the currently displayed popup
  const popup = useRef<maplibregl.Popup | null>(null);

  // State used to track whether the map has finished loading
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // ============================================================
  // MAP INITIALIZATION
  // ============================================================
  //
  // This effect runs once when the component is mounted.
  // It creates and configures the MapLibre map.
  //
  useEffect(() => {
    // Don't initialize the map if:
    // 1. The container does not exist yet, OR
    // 2. A map has already been initialized
    if (!mapContainer.current || map.current) return;

    // Create a new MapLibre map instance
    map.current = new maplibregl.Map({
      // HTML element in which the map will be displayed
      container: mapContainer.current,

      // Map style configuration
      style: {
        version: 8,

        // Define map data sources
        sources: {
          // OpenStreetMap raster tile source
          "osm-tiles": {
            type: "raster",

            // URL template used to download map tiles
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],

            // Size of each map tile
            tileSize: 256,

            // Required attribution for OpenStreetMap
            attribution: "© OpenStreetMap contributors",
          },
        },

        // Layers that display the map sources
        layers: [
          {
            // Unique ID for the OSM layer
            id: "osm-layer",

            // Raster layer because OSM provides raster images
            type: "raster",

            // Use the OSM tile source defined above
            source: "osm-tiles",

            // Visual adjustments to the OSM map
            paint: {
              // Reduce color saturation
              "raster-saturation": -0.6,

              // Increase contrast
              "raster-contrast": 0.2,

              // Limit maximum brightness
              "raster-brightness-max": 0.4,
            },
          },
        ],
      },

      // Initial longitude and latitude of the map
      // Approximately centered on the campus
      center: [80.198, 12.751],

      // Initial zoom level
      zoom: 17.2,

      // Tilt the map to create a 3D perspective
      pitch: 60,

      // Rotate the map slightly
      bearing: -17,

      // Enable antialiasing for smoother rendering
      antialias: true,
    });

    // ============================================================
    // NAVIGATION CONTROLS
    // ============================================================

    // Add zoom, rotate and other navigation controls
    // to the top-left corner of the map
    map.current.addControl(new maplibregl.NavigationControl(), "top-left");

    // ============================================================
    // MAP LOAD EVENT
    // ============================================================

    // This event is triggered after MapLibre finishes loading
    map.current.on("load", () => {
      // Update state so that other map layers can safely be added
      setIsMapLoaded(true);
    });

    // ============================================================
    // CLEANUP
    // ============================================================

    // This function runs when the component is unmounted
    return () => {
      // Remove any currently displayed popup
      popup.current?.remove();

      // Destroy the MapLibre map instance
      map.current?.remove();

      // Reset the map reference
      map.current = null;
    };
  }, []); // Empty dependency array means this runs only once

  // ============================================================
  // ADD / UPDATE CAMPUS BUILDING DATA
  // ============================================================
  //
  // This effect runs whenever:
  // - geoJSON changes
  // - map finishes loading
  // - onBuildingClick changes
  //
  useEffect(() => {
    // Don't continue until:
    // 1. Map exists
    // 2. Map has loaded
    // 3. GeoJSON data is available
    if (!map.current || !isMapLoaded || !geoJSON) return;

    // Unique ID for the GeoJSON source
    const sourceId = "campus-buildings";

    // Check whether the building source already exists
    const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource;

    // ============================================================
    // UPDATE EXISTING GEOJSON SOURCE
    // ============================================================

    if (source) {
      // If the source already exists, update its data
      // This allows building information to change dynamically
      source.setData(geoJSON as any);
    } else {
      // ============================================================
      // CREATE GEOJSON SOURCE
      // ============================================================

      // Add the campus building GeoJSON as a new map source
      map.current.addSource(sourceId, {
        type: "geojson",
        data: geoJSON as any,
      });

      // ============================================================
      // 3D BUILDING LAYER
      // ============================================================

      // Render buildings as 3D extruded structures
      map.current.addLayer({
        // Unique layer ID
        id: "3d-buildings",

        // Use the campus building GeoJSON source
        source: sourceId,

        // fill-extrusion creates 3D polygon buildings
        type: "fill-extrusion",

        // Visual properties of the 3D buildings
        paint: {
          // Building height is obtained from GeoJSON properties
          "fill-extrusion-height": ["get", "height"],

          // Buildings start from ground level
          "fill-extrusion-base": 0,

          // Building color depends on its heat level
          //
          // 0%   -> Green
          // 50%  -> Yellow
          // 100% -> Red
          //
          // This creates a heat-map style visualization.
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "heatLevel"],

            // Low heat
            0,
            "#00E676",

            // Medium heat
            50,
            "#FFEA00",

            // High heat
            100,
            "#FF1744",
          ],

          // Slight transparency allows the underlying map
          // to remain visible
          "fill-extrusion-opacity": 0.92,
        },
      });

      // ============================================================
      // BUILDING OUTLINES
      // ============================================================

      // Add a line layer around each building
      // to make building boundaries easier to see
      map.current.addLayer({
        id: "building-outlines",

        // Use the same GeoJSON source
        source: sourceId,

        // Render polygon boundaries as lines
        type: "line",

        // Visual properties of the outlines
        paint: {
          // Semi-transparent white outline
          "line-color": "rgba(255, 255, 255, 0.3)",

          // Width of the building boundary
          "line-width": 1,
        },
      });

      // ============================================================
      // BUILDING CLICK EVENT
      // ============================================================

      // Listen for clicks on the 3D building layer
      map.current.on("click", "3d-buildings", (e) => {
        // Make sure a building was actually clicked
        if (!e.features?.length) return;

        // Get properties stored in the clicked GeoJSON feature
        const props = e.features[0].properties;

        // --------------------------------------------------------
        // Send building information to the parent component
        // --------------------------------------------------------

        if (onBuildingClick) {
          onBuildingClick(props);
        }

        // --------------------------------------------------------
        // Remove any previously displayed popup
        // --------------------------------------------------------

        popup.current?.remove();

        // --------------------------------------------------------
        // Create a new popup
        // --------------------------------------------------------

        popup.current = new maplibregl.Popup({
          // Display a close button
          closeButton: true,

          // Distance between popup and clicked location
          offset: 30,
        })

          // Position popup at the clicked coordinates
          .setLngLat(e.lngLat)

          // HTML content displayed inside the popup
          .setHTML(
            `
            <div class="font-display text-secondary font-bold text-sm mb-2">
              ${props.name?.replace(/_/g, " ") || "Building"}
            </div>

            <div class="space-y-1 text-xs">

              <!-- Heat level -->
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">
                  Heat Level
                </span>

                <span class="font-semibold">
                  ${props.heatLevel}%
                </span>
              </div>

              <!-- Building height -->
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">
                  Height
                </span>

                <span class="font-semibold">
                  ${props.height}m
                </span>
              </div>

              <!-- Carbon emission -->
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">
                  Carbon
                </span>

                <span class="font-semibold text-primary">
                  ${props.carbon?.toFixed(1)} kg/h
                </span>
              </div>

            </div>
          `,
          )

          // Add popup to the map
          .addTo(map.current!);
      });

      // ============================================================
      // MOUSE ENTER EVENT
      // ============================================================

      // Change the cursor when the mouse moves over a building
      map.current.on("mouseenter", "3d-buildings", () => {
        if (map.current) {
          // Change cursor to pointer to indicate
          // that the building is clickable
          map.current.getCanvas().style.cursor = "pointer";
        }
      });

      // ============================================================
      // MOUSE LEAVE EVENT
      // ============================================================

      // Reset cursor when the mouse leaves the building
      map.current.on("mouseleave", "3d-buildings", () => {
        if (map.current) {
          // Restore the default cursor
          map.current.getCanvas().style.cursor = "";
        }
      });
    }
  }, [geoJSON, isMapLoaded, onBuildingClick]);

  // ============================================================
  // COMPONENT UI
  // ============================================================

  return (
    // Full-screen container for the map
    <div className="absolute inset-0">
      {/* MapLibre renders the map inside this div */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 
        Gradient overlay placed above the map.
        pointer-events-none ensures that the overlay does not
        block clicks or mouse interactions with the map.
      */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          bg-gradient-to-t
          from-background/60
          via-transparent
          to-background/30
        "
      />
    </div>
  );
};

// Export the component so it can be used in other files
export default CampusMap;
