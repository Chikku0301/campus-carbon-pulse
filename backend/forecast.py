# Predicts the next 24 hours of carbon emissions for all buildings
# using pre-trained LSTM models.

import sys
import os
import json
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
from datetime import datetime

# -------------------------------------------------------------------
# Configure UTF-8 encoding for stdout and stderr.
# This prevents UnicodeEncodeError on Windows terminals.
# -------------------------------------------------------------------
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# -------------------------------------------------------------------
# Constants
# -------------------------------------------------------------------

# Sequence length used during training
# 168 hours = 7 days × 24 hours
SEQ_LEN = 168

# Directory containing trained LSTM models and scalers
MODEL_DIR = "models"

# Historical dataset
DATA_PATH = "snuc_carbon_year_2025.csv"

# Output JSON file containing predictions
OUTPUT_JSON = "emissions.json"


def generate_24h_forecast_json():
    """
    Generates real-time 24-hour carbon emission forecasts.

    Workflow:
    1. Read historical emission data.
    2. Determine the current hour.
    3. Extract the previous 168 hours of data.
    4. Load each building's trained LSTM model.
    5. Predict emissions recursively for the next 24 hours.
    6. Store all predictions in emissions.json.
    """

    # ---------------------------------------------------------------
    # Configure UTF-8 encoding again for safety.
    # Useful when this function is executed independently.
    # ---------------------------------------------------------------
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    # ---------------------------------------------------------------
    # Load historical emission data
    # ---------------------------------------------------------------
    df = pd.read_csv(DATA_PATH)

    # Convert timestamp column into datetime format
    df["Timestamp"] = pd.to_datetime(df["Timestamp"])

    # Sort data by building and timestamp
    df = df.sort_values(["Building_ID", "Timestamp"])

    # ---------------------------------------------------------------
    # Determine the current hour
    # ---------------------------------------------------------------

    # Current system time
    now = datetime.now()

    # Round down to the nearest hour
    current_hour = now.replace(minute=0, second=0, microsecond=0)

    print(f"🕐 Current time: {now}")
    print(f"📍 Rounded to: {current_hour}")

    # ---------------------------------------------------------------
    # Determine the historical window required for prediction
    # ---------------------------------------------------------------

    # Start time = current hour - previous 168 hours
    start_time = current_hour - pd.Timedelta(hours=SEQ_LEN)

    print(f"📊 Using data from {start_time} to {current_hour}")

    # Dictionary to store forecasts of every building
    forecast_output = {}

    # ---------------------------------------------------------------
    # Iterate through every saved LSTM model
    # ---------------------------------------------------------------
    for file in os.listdir(MODEL_DIR):

        # Ignore files that are not trained LSTM models
        if not file.startswith("lstm_") or not file.endswith(".keras"):
            continue

        # Extract building ID from filename
        building_id = file.replace("lstm_", "").replace(".keras", "")

        # -----------------------------------------------------------
        # Load trained LSTM model
        # -----------------------------------------------------------
        model = load_model(os.path.join(MODEL_DIR, file))

        # Load corresponding MinMax scaler
        scaler = joblib.load(
            os.path.join(MODEL_DIR, f"scaler_{building_id}.joblib")
        )

        # -----------------------------------------------------------
        # Extract emission history for the current building
        # -----------------------------------------------------------
        building_df = df[df["Building_ID"] == building_id].copy()

        # Keep only data available up to the current hour
        building_df = building_df[building_df["Timestamp"] <= current_hour]

        # Ensure sufficient historical data exists
        if len(building_df) < SEQ_LEN:
            print(
                f"⚠️  Warning: Not enough data for {building_id}. "
                f"Need {SEQ_LEN}, have {len(building_df)}"
            )
            continue

        # Get the last 168 hourly emission values
        series = building_df["Total_CO2e_kg"].values[-SEQ_LEN:].reshape(-1, 1)

        # Normalize values using the saved scaler
        scaled_series = scaler.transform(series)

        # Reshape into the input format expected by the LSTM
        # Shape = (batch_size, sequence_length, features)
        history = scaled_series.reshape(1, SEQ_LEN, 1)

        # Dictionary to store forecasts for one building
        building_forecast = {}

        # -----------------------------------------------------------
        # Recursive forecasting for the next 24 hours
        # -----------------------------------------------------------
        for hour in range(1, 25):

            # Predict the next normalized value
            pred_scaled = model.predict(history, verbose=0)[0][0]

            # Convert prediction back to the original emission scale
            pred_real = scaler.inverse_transform([[pred_scaled]])[0][0]

            # Compute timestamp corresponding to this prediction
            forecast_time = current_hour + pd.Timedelta(hours=hour)

            # Store prediction
            building_forecast[str(forecast_time)] = round(float(pred_real), 2)

            # -------------------------------------------------------
            # Update input history for recursive forecasting
            #
            # Remove the oldest value
            # Append the newly predicted value
            # -------------------------------------------------------
            history = np.roll(history, -1, axis=1)
            history[0, -1, 0] = pred_scaled

        # Save predictions of the current building
        forecast_output[building_id] = building_forecast

        print(f"✅ Forecasted {building_id}: {hour} hours ahead")

    # ---------------------------------------------------------------
    # Save all forecasts into a JSON file
    # ---------------------------------------------------------------
    with open(OUTPUT_JSON, "w") as f:
        json.dump(forecast_output, f, indent=4)

    print(f"\n✅ Forecast saved to {OUTPUT_JSON}")

    print(
        f"📅 Forecast period: "
        f"{current_hour + pd.Timedelta(hours=1)} "
        f"to "
        f"{current_hour + pd.Timedelta(hours=24)}"
    )

    return forecast_output


# -------------------------------------------------------------------
# Program Entry Point
# -------------------------------------------------------------------
if __name__ == "__main__":
    generate_24h_forecast_json()