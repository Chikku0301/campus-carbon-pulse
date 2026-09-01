/** Descriptive and environmental properties associated with a campus building. */
export interface BuildingProperties {
  /** Display name of the building. */
  name: string;

  /** Building height, typically expressed in meters. */
  height: number;

  /** Relative heat intensity associated with the building. */
  heatLevel: number;

  /** Carbon emissions or carbon-impact value for the building. */
  carbon: number;
}

/** GeoJSON polygon feature representing a campus building. */
export interface CampusFeature {
  /** GeoJSON object type. */
  type: "Feature";

  /** Building-specific properties. */
  properties: BuildingProperties;

  /** Polygon geometry describing the building's footprint. */
  geometry: {
    /** Polygon coordinates represented as arrays of linear rings. */
    coordinates: number[][][];

    /** GeoJSON geometry type. */
    type: "Polygon";
  };

  /** Unique numeric identifier for the feature. */
  id: number;
}

/** GeoJSON feature collection containing campus buildings. */
export interface CampusGeoJSON {
  /** GeoJSON collection type. */
  type: "FeatureCollection";

  /** Campus building features included in the collection. */
  features: CampusFeature[];
}

/** Historical campus carbon data recorded on a specific date. */
export interface HistoricalDataPoint {
  /** Date associated with the data point, typically in ISO 8601 format. */
  date: string;

  /** Recorded carbon-emissions value. */
  carbon: number;

  /** Number of buildings represented by the data point. */
  buildings: number;
}

/** Carbon forecast for a specific hour. */
export interface ForecastDataPoint {
  /** Hour represented by the forecast. */
  hour: number;

  /** Forecasted carbon-emissions value. */
  carbon: number;

  /** Human-readable label for the forecast period. */
  label: string;
}

/** Forecasted environmental metrics for a single building and hour. */
export interface BuildingForecast {
  /** Number of hours from the forecast's base timestamp. */
  hour_offset: number;

  /** Forecasted carbon-emissions value. */
  carbon_emission: number;

  /** Forecasted heat-level value. */
  heat_level: number;
}

/** API response containing hourly forecasts grouped by building identifier. */
export interface ForecastResponse {
  /** Base timestamp for the forecast, typically in ISO 8601 format. */
  timestamp: string;

  /** Forecast data keyed by building identifier or name. */
  forecasts: Record<
    string,
    {
      /** Hourly forecast entries for the building. */
      hourly: BuildingForecast[];
    }
  >;
}
