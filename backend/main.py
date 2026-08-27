# Standard-library modules for stream setup, JSON data, dates, and file checks.
import sys
import json
import os
from datetime import datetime

# Third-party libraries for data handling, API creation, CORS, and AI insights.
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv, find_dotenv

# Local forecasting function used when the backend starts.
from forecast import generate_24h_forecast_json


# Configure UTF-8 output to support symbols in Windows terminals.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


# Load environment variables, including GEMINI_API_KEY, from a .env file.
load_dotenv()

# Create the FastAPI application.
app = FastAPI()


# Generate fresh forecast data whenever the backend starts.
@app.on_event("startup")
async def startup_event():
    # Reconfigure streams again for Windows command-line compatibility.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    print("\n" + "=" * 60)
    print("🚀 Starting Campus Carbon Pulse Backend...")
    print("=" * 60)
    print("\n📊 Generating fresh forecasts aligned with current time...")

    try:
        # Generate the latest 24-hour emissions forecast.
        generate_24h_forecast_json()

        print("\n✅ Forecasts generated successfully!")
        print("🌐 Backend ready to serve requests.\n")

    except Exception as e:
        # Keep the server available even if forecast generation fails.
        print(f"\n⚠️ Warning: Failed to generate forecasts: {e}")
        print("Backend will use existing emissions.json if available.\n")


# Allow the locally running frontend to call this API from another origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# File containing forecasted building emissions.
EMISSIONS_FILE = "emissions.json"

# GeoJSON file used by the frontend campus map.
GEOJSON_FILE = "../public/campus.json"


def load_data():
    """
    Load emissions data from the JSON file.

    Returns an empty dictionary if the file is not available yet.
    """
    if not os.path.exists(EMISSIONS_FILE):
        return {}

    with open(EMISSIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# Load emissions once at server startup to avoid rereading the file per request.
EMISSIONS_DATA = load_data()


def update_geojson_file(results):
    """
    Add current emissions and heat-level values to campus GeoJSON features.

    The updated file is consumed by the frontend map.
    """
    # Configure UTF-8 output for Windows terminals.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    # Stop safely if the frontend map file is unavailable.
    if not os.path.exists(GEOJSON_FILE):
        print(f"Warning: {GEOJSON_FILE} not found. Skipping GeoJSON update.")
        return

    # Load existing map data.
    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    # Create a dictionary for fast lookup by building ID.
    data_map = {
        item["building_id"]: {
            "carbon": item["total_emission"],
            "heatLevel": item["scaled_emission"],
        }
        for item in results
    }

    # Standard building heights used for consistent 3D map rendering.
    standard_heights = {
        "Large_Hostel_Boys": 35,
        "Large_Hostel_Girls": 35,
        "Academic_Block_Large": 25,
        "Academic_Block_Small": 20,
        "Library": 22,
        "Boys_Mess": 15,
        "Girls_Mess": 15,
        "Canteen": 12,
        "Clinic": 12,
        "Sports_Complex": 18,
        "Small_Hostel_Boys": 25,
        "Small_Hostel_Girls": 25,
    }

    # Count how many map features receive live emissions values.
    updated_count = 0

    for feature in geojson_data.get("features", []):
        # Support either legacy "Name" or standard lowercase "name".
        building_name = (
            feature["properties"].get("Name")
            or feature["properties"].get("name")
        )

        # Store the normalized lowercase property expected by the frontend.
        feature["properties"]["name"] = building_name

        # Use the configured height or a default height of 15.
        feature["properties"]["height"] = standard_heights.get(building_name, 15)

        # Add carbon and heat-level data only when emissions data exists.
        if building_name in data_map:
            feature["properties"]["carbon"] = data_map[building_name]["carbon"]
            feature["properties"]["heatLevel"] = data_map[building_name]["heatLevel"]
            updated_count += 1

    # Save the modified GeoJSON for the frontend map.
    with open(GEOJSON_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=4)

    print(
        f"✅ Success: {updated_count} buildings updated "
        "with live data and fixed heights."
    )


@app.get("/get-emissions/{target_hour}")
async def get_emissions(target_hour: int):
    """
    Return emissions for all buildings at a requested hour.

    Values are scaled from 0 to 100 for frontend heat-map coloring.
    """
    # Validate the hour as a valid 24-hour clock value.
    if not (0 <= target_hour <= 23):
        raise HTTPException(
            status_code=400,
            detail="Hour must be between 0 and 23",
        )

    # Store one matching emissions value per building.
    extracted_results = []

    # Search every building's timestamped emissions data.
    for building_id, timestamps in EMISSIONS_DATA.items():
        for ts_str, value in timestamps.items():
            dt_obj = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")

            # Add the first record matching the requested hour.
            if dt_obj.hour == target_hour:
                extracted_results.append(
                    {
                        "building_id": building_id,
                        "total_emission": value,
                    }
                )
                break

    # Return an error if no values exist for the selected hour.
    if not extracted_results:
        raise HTTPException(
            status_code=404,
            detail="No data found for this hour",
        )

    # Convert results to a DataFrame for emission scaling.
    df = pd.DataFrame(extracted_results)

    # Gather every emission value to keep color scaling consistent across hours.
    all_emissions = []

    for timestamps in EMISSIONS_DATA.values():
        all_emissions.extend(timestamps.values())

    global_min = min(all_emissions)
    global_max = max(all_emissions)

    # Avoid division by zero if every value is identical.
    if global_max == global_min:
        df["scaled_emission"] = 0.0
    else:
        df["scaled_emission"] = (
            (df["total_emission"] - global_min)
            / (global_max - global_min)
        ) * 100

    # Build a clean, rounded JSON response.
    final_output = []

    for _, row in df.iterrows():
        final_output.append(
            {
                "building_id": row["building_id"],
                "total_emission": round(row["total_emission"], 2),
                "scaled_emission": round(row["scaled_emission"], 2),
            }
        )

    # Synchronize the frontend map with the selected hour's data.
    update_geojson_file(final_output)

    return {
        "hour": target_hour,
        "results": final_output,
    }


@app.get("/get-historical-data/{days}")
async def get_historical_data(days: int):
    """
    Return daily average campus emissions for the requested number of days.
    """
    # Restrict requests to a maximum one-year period.
    if not (1 <= days <= 365):
        raise HTTPException(
            status_code=400,
            detail="Days must be between 1 and 365",
        )

    # CSV file containing historical building emissions.
    csv_file = "snuc_carbon_year_2025.csv"

    if not os.path.exists(csv_file):
        raise HTTPException(
            status_code=404,
            detail="Historical data file not found",
        )

    # Load the CSV and convert its timestamp column to datetime values.
    df = pd.read_csv(csv_file)
    df["Timestamp"] = pd.to_datetime(df["Timestamp"])

    # Use the newest available date as the endpoint of the range.
    max_date = df["Timestamp"].max()

    # Calculate the beginning date for the requested period.
    start_date = max_date - pd.Timedelta(days=days - 1)

    # Keep only records within the requested date range.
    filtered_df = df[df["Timestamp"] >= start_date].copy()

    # Extract date and hour for grouping.
    filtered_df["Date"] = filtered_df["Timestamp"].dt.date
    filtered_df["Hour"] = filtered_df["Timestamp"].dt.hour

    # Sum all building emissions for every campus hour.
    hourly_totals = (
        filtered_df.groupby(["Date", "Hour"])["Total_CO2e_kg"]
        .sum()
        .reset_index()
    )

    # Calculate each day's average hourly campus emissions.
    daily_averages = (
        hourly_totals.groupby("Date")["Total_CO2e_kg"]
        .mean()
        .reset_index()
    )

    # Format data for frontend chart consumption.
    historical_data = []

    for _, row in daily_averages.iterrows():
        historical_data.append(
            {
                "date": row["Date"].strftime("%b %d"),
                "carbon": round(row["Total_CO2e_kg"], 2),
                "buildings": 12,
            }
        )

    return {
        "days": days,
        "data": historical_data,
    }


@app.get("/get-insights")
async def get_insights():
    """
    Generate AI-based emissions insights using the Google Gemini API.
    """
    # The endpoint requires forecast emissions data.
    if not os.path.exists(EMISSIONS_FILE):
        raise HTTPException(
            status_code=404,
            detail="Emissions data file not found",
        )

    try:
        # Load the emissions data used to build the AI prompt.
        with open(EMISSIONS_FILE, "r", encoding="utf-8") as f:
            emissions_data = json.load(f)

        # Lists and dictionaries for calculated campus statistics.
        all_emissions = []
        building_totals = {}
        hourly_totals = {}

        # Calculate total emissions per building and per hour.
        for building_id, timestamps in emissions_data.items():
            building_total = 0

            for ts_str, value in timestamps.items():
                dt_obj = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                hour = dt_obj.hour

                # Add this value to the current building's total.
                building_total += value

                # Initialize the hour total when it is first encountered.
                if hour not in hourly_totals:
                    hourly_totals[hour] = 0

                # Add this value to the corresponding campus-hour total.
                hourly_totals[hour] += value

                # Keep values for overall average calculation.
                all_emissions.append(value)

            # Save this building's total after processing all timestamps.
            building_totals[building_id] = building_total

        # Identify the hour with the highest total campus emissions.
        peak_hour = max(hourly_totals, key=hourly_totals.get)
        peak_emission = hourly_totals[peak_hour]

        # Sort buildings from highest to lowest total emissions.
        sorted_buildings = sorted(
            building_totals.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        # Keep the three highest-emitting buildings.
        top_3_buildings = sorted_buildings[:3]

        # Calculate overall total and average emissions.
        total_emissions = sum(all_emissions)
        avg_emission = (
            total_emissions / len(all_emissions)
            if all_emissions
            else 0
        )

        # Create a compact statistical summary for Gemini.
        summary = {
            "total_emissions": round(total_emissions, 2),
            "average_emission": round(avg_emission, 2),
            "peak_hour": peak_hour,
            "peak_emission": round(peak_emission, 2),
            "top_buildings": [
                {"name": name, "total": round(total, 2)}
                for name, total in top_3_buildings
            ],
            "building_count": len(building_totals),
        }

        # Read the Gemini API key from environment variables.
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not set in environment variables",
            )

        # Initialize the Google Gemini client.
        client = genai.Client(api_key=api_key)

        # Ask Gemini to return a strict JSON object for the frontend.
        prompt = f"""You are analyzing carbon emissions data for a university campus with {summary['building_count']} buildings.

DATA SUMMARY:
- Total Daily Emissions: {summary['total_emissions']} kg CO2e
- Average Hourly Emission: {summary['average_emission']} kg CO2e
- Peak Hour: {summary['peak_hour']}:00 with {summary['peak_emission']} kg CO2e
- Top 3 Polluting Buildings: {', '.join([f"{b['name']} ({b['total']} kg)" for b in summary['top_buildings']])}

TASK: Provide structured insights in JSON format with the following structure:

{{
  "summary": "A brief 2-3 sentence overview of the campus emissions situation",
  "categories": [
    {{
      "type": "peak_hours",
      "title": "Peak Emission Periods",
      "items": [
        {{
          "title": "Short title",
          "description": "Detailed explanation of when and why emissions peak",
          "value": "Specific metric or time"
        }}
      ]
    }},
    {{
      "type": "buildings",
      "title": "Building Analysis",
      "items": [
        {{
          "title": "Building name or pattern",
          "description": "Analysis of building emissions and patterns",
          "value": "Percentage or emission value"
        }}
      ]
    }},
    {{
      "type": "trends",
      "title": "Emission Trends",
      "items": [
        {{
          "title": "Trend name",
          "description": "Notable pattern across the day or between buildings",
          "value": "Relevant metric"
        }}
      ]
    }},
    {{
      "type": "recommendations",
      "title": "Recommended Actions",
      "items": [
        {{
          "title": "Action name",
          "description": "Detailed, actionable measure to reduce emissions (2-3 sentences)",
          "impact": "Estimated impact or benefit"
        }}
      ]
    }}
  ]
}}

REQUIREMENTS:
- Provide 2-3 items for peak_hours, buildings, and trends
- Provide 4-6 detailed, actionable recommendations
- Be specific and reference the actual data
- Make descriptions informative but concise
- Focus on practical, implementable solutions for a university campus
- Return ONLY valid JSON, no markdown formatting or code blocks"""

        # Request AI-generated content from Gemini.
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        # Get the model's text response.
        response_text = response.text.strip()

        # Remove Markdown fences if Gemini includes them despite the prompt.
        if response_text.startswith("```json"):
            response_text = response_text[7:]

        if response_text.startswith("```"):
            response_text = response_text[3:]

        if response_text.endswith("```"):
            response_text = response_text[:-3]

        # Parse the cleaned response into a Python dictionary.
        insights_json = json.loads(response_text.strip())

        return {
            "success": True,
            "insights": insights_json,
        }

    except json.JSONDecodeError as e:
        # Return a useful error if Gemini does not provide valid JSON.
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response as JSON: {str(e)}",
        )

    except Exception as e:
        # Return an API error for other issues, such as Gemini request failures.
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}",
        )