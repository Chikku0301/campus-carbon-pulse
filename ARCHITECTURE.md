# 🌍 Campus Carbon Pulse — Backend Architecture & Documentation

The Campus Carbon Pulse backend is a FastAPI service that generates 24-hour carbon-emission forecasts for campus buildings, serves data to the frontend dashboard, and provides AI-generated sustainability insights.

---

## 📁 Backend File Structure

```text
backend/
├── venv/                              # Python virtual environment
├── models/                            # Trained LSTM models and scaler files
├── main.py                            # FastAPI server, API endpoints, and map updates
├── forecast.py                        # Forecast generation and recursive LSTM logic
├── emissions.json                     # Generated 24-hour building-emissions forecast
├── snuc_carbon_year_2025.csv          # Historical campus-emissions dataset
├── requirements.txt                   # Project dependencies
└── .env                               # Environment variables, including GEMINI_API_KEY

public/
└── campus.json                        # GeoJSON building coordinates and live map data
```
