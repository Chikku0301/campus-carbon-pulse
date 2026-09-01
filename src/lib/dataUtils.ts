import {
  CampusGeoJSON,
  ForecastDataPoint,
  ForecastResponse,
} from "@/types/campus";

/**
 * Applies forecasted heat and carbon values to each matching GeoJSON feature.
 *
 * @param geoJSON - Campus GeoJSON containing the building features to update.
 * @param forecastData - Forecast data grouped by building name.
 * @param hour - Index of the hourly forecast to apply.
 * @returns A new GeoJSON object with updated building properties.
 */
export const mergeForecastWithGeoJSON = (
  geoJSON: CampusGeoJSON,
  forecastData: ForecastResponse,
  hour: number,
): CampusGeoJSON => {
  // Create a new feature array without mutating the original GeoJSON.
  const updatedFeatures = geoJSON.features.map((feature) => {
    // Forecast keys are expected to match the GeoJSON building names.
    const buildingName = feature.properties.name;
    const buildingForecast = forecastData.forecasts[buildingName];

    // Retrieve the forecast at the requested hourly array index.
    const hourlyData = buildingForecast?.hourly[hour];

    if (hourlyData) {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          heatLevel: hourlyData.heat_level,
          carbon: hourlyData.carbon_emission,
        },
      };
    }

    // Preserve the feature's current values when no matching forecast exists.
    return feature;
  });

  return {
    ...geoJSON,
    features: updatedFeatures,
  };
};

/**
 * Converts building-level forecasts into campus-wide hourly chart data.
 *
 * Carbon emissions from every building are summed for each of the next
 * 24 forecast hours.
 *
 * @param forecastData - Forecast data grouped by building name.
 * @returns Aggregated and rounded carbon values for chart rendering.
 */
export const convertForecastToChartData = (
  forecastData: ForecastResponse,
): ForecastDataPoint[] => {
  // Store the total carbon emissions for each forecast hour.
  const hourlyTotals: Record<number, number> = {};

  // Initialize all 24 hours so the chart includes hours without forecast data.
  for (let hour = 0; hour < 24; hour++) {
    hourlyTotals[hour] = 0;
  }

  // Add each building's carbon emissions to the corresponding hourly total.
  Object.values(forecastData.forecasts).forEach((building) => {
    building.hourly.forEach((point) => {
      // Ignore forecast points outside the initialized 24-hour range.
      if (hourlyTotals[point.hour_offset] !== undefined) {
        hourlyTotals[point.hour_offset] += point.carbon_emission;
      }
    });
  });

  // Convert the totals into the format expected by the chart.
  return Object.entries(hourlyTotals).map(([hour, carbon]) => ({
    hour: Number(hour),
    carbon: Math.round(carbon),
    label: Number(hour) === 0 ? "Now" : `+${hour}h`,
  }));
};
