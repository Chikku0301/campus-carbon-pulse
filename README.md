# Campus Carbon Pulse

## AI-Powered Digital Twin for Campus Carbon Footprint Monitoring

<<<<<<< HEAD
A real-time 3D visualization platform that predicts and monitors campus-wide carbon emissions using LSTM-based forecasting models. The system provides a digital twin of the campus, enabling interactive visualization of predicted emissions over a 24-hour period.
=======
A real-time 3D visualization dashboard that leverages **LSTM neural networks** to predict and monitor carbon emissions across campus buildings over a 24-hour period.
>>>>>>> e65b8f8 (updated forecast.py with comments)

![Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)

---

# Features

<<<<<<< HEAD
- 🤖 **LSTM-Based Forecasting** – Predicts carbon emissions for the next 24 hours using trained neural network models.
- 🗺️ **Interactive 3D Campus Map** – Visualizes building-wise emissions through dynamic color-coded heat maps.
- 📊 **Live Analytics Dashboard** – Displays real-time campus emission metrics and insights.
- ⏱️ **Time-Based Exploration** – Navigate through hourly predictions using an interactive time slider.
- 🎨 **Modern User Interface** – Glassmorphic design with responsive interactions and smooth animations.
=======
- 🤖 **LSTM-Based Forecasting** – Predicts carbon emissions for the next 24 hours using trained LSTM models.
- 🗺️ **Interactive 3D Map** – Visualizes campus buildings with real-time, color-coded emission levels.
- 📊 **Live Dashboard** – Displays dynamic campus-wide emission metrics.
- ⏱️ **Time Slider** – Explore predicted emissions for any hour of the day.
- 🎨 **Modern UI** – Glassmorphic interface with smooth animations and an intuitive user experience.
>>>>>>> e65b8f8 (updated forecast.py with comments)

---

# Tech Stack

<<<<<<< HEAD
### Frontend
=======
## Frontend
>>>>>>> e65b8f8 (updated forecast.py with comments)

- React 18
- TypeScript
- Vite
- MapLibre GL
- Tailwind CSS
- shadcn/ui

<<<<<<< HEAD
### Backend

- FastAPI
=======
## Backend

- FastAPI
- Python
>>>>>>> e65b8f8 (updated forecast.py with comments)
- TensorFlow / Keras
- Pandas
- Uvicorn

---

# Installation

<<<<<<< HEAD
### Prerequisites
=======
## Prerequisites
>>>>>>> e65b8f8 (updated forecast.py with comments)

- Node.js 18+
- npm
- Python 3.8+
- Git

<<<<<<< HEAD
### Clone the Repository
=======
## 1. Clone the Repository
>>>>>>> e65b8f8 (updated forecast.py with comments)

```bash
git clone <your-repository-url>
cd campus-carbon-pulse-main
```

<<<<<<< HEAD
### Frontend Setup
=======
## 2. Frontend Setup
>>>>>>> e65b8f8 (updated forecast.py with comments)

```bash
npm install
<<<<<<< HEAD
npm run dev
```

The frontend will be available at:

```
http://localhost:8080
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
=======

# Start the development server
# Runs on http://localhost:8080
npm run dev
```

## 3. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment

# Windows
venv\Scripts\activate

# macOS / Linux
>>>>>>> e65b8f8 (updated forecast.py with comments)
source venv/bin/activate

pip install -r requirements.txt

<<<<<<< HEAD
=======
# Start the FastAPI server
# Runs on http://localhost:8000
>>>>>>> e65b8f8 (updated forecast.py with comments)
python -m uvicorn main:app --reload --port 8000
```

The backend runs at:

```
http://localhost:8000
```

---

# Usage

<<<<<<< HEAD
1. Start the FastAPI backend.
2. Launch the React frontend.
3. Open the application in your browser.
4. Explore campus emissions by:
   - Adjusting the hourly time slider.
   - Clicking on buildings to inspect emission statistics.
   - Observing real-time color transitions based on predicted emission levels.
=======
1. Start the backend server (Port **8000**).
2. Start the frontend development server (Port **8080**).
3. Open your browser and navigate to:

```
http://localhost:8080
```

4. Explore the application:
   - Adjust the time slider to visualize emissions at different hours.
   - Click on buildings to view detailed emission metrics.
   - Observe building colors update based on predicted carbon emissions.
>>>>>>> e65b8f8 (updated forecast.py with comments)

---

# Project Structure

```text
campus-carbon-pulse-main/
├── backend/
│   ├── models/              # Trained LSTM models (*.keras)
│   ├── main.py              # FastAPI application
│   ├── forecast.py          # Prediction pipeline
│   ├── emissions.json       # Generated 24-hour forecasts
│   ├── campus.json          # GeoJSON building data
<<<<<<< HEAD
│   └── requirements.txt     # Backend dependencies
=======
│   └── requirements.txt     # Python dependencies
>>>>>>> e65b8f8 (updated forecast.py with comments)
│
├── src/
│   ├── components/          # React components
│   ├── pages/               # Application pages
│   ├── lib/                 # Utility functions
<<<<<<< HEAD
│   └── types/               # TypeScript definitions
│
├── public/
│   └── campus.json          # Static GeoJSON dataset
│
├── package.json
└── vite.config.ts
=======
│   └── types/               # TypeScript types
│
├── public/
│   └── campus.json          # Static GeoJSON data
│
├── package.json             # Node dependencies
└── vite.config.ts           # Vite configuration
>>>>>>> e65b8f8 (updated forecast.py with comments)
```

---

<<<<<<< HEAD
## System Workflow

1. Historical campus energy consumption data is collected in CSV format.
2. Individual LSTM models are trained for each building to capture energy usage patterns.
3. The trained models generate 24-hour forecasts through `forecast.py`, which are stored in `emissions.json`.
4. FastAPI exposes the predictions via the `/get-emissions/{hour}` endpoint.
5. The React application retrieves these predictions and updates the 3D campus visualization in real time.

---

## Emission Color Scale

| Level     | Range   |
| --------- | ------- |
| 🟢 Green  | 0–33%   |
| 🟡 Yellow | 34–66%  |
| 🔴 Red    | 67–100% |

---

## API
=======
# How It Works

1. **Data Collection** – Historical campus energy consumption data is collected in CSV format.
2. **Model Training** – Individual LSTM models are trained for each building to learn energy consumption patterns.
3. **Forecast Generation** – `forecast.py` generates 24-hour emission predictions and stores them in `emissions.json`.
4. **API Service** – FastAPI exposes the predictions through the `/get-emissions/{hour}` endpoint.
5. **Visualization** – The React frontend retrieves the predictions and updates the 3D campus map in real time.

---

# Color Scale

Buildings are color-coded according to their predicted emission levels:

- 🟢 **Green (0–33%)** – Low emissions
- 🟡 **Yellow (34–66%)** – Moderate emissions
- 🔴 **Red (67–100%)** – High emissions

---

# API Endpoint
>>>>>>> e65b8f8 (updated forecast.py with comments)

## `GET /get-emissions/{hour}`

<<<<<<< HEAD
Returns the predicted carbon emissions for all campus buildings at a specified hour (0–23).

### Sample Response
=======
Returns the predicted carbon emissions for a specified hour (**0–23**).

### Response
>>>>>>> e65b8f8 (updated forecast.py with comments)

```json
{
  "hour": 10,
  "results": [
    {
      "building_id": "Academic_Block_Large",
      "total_emission": 110.77,
      "scaled_emission": 70.5
    }
  ]
}
```

---

# Contributing

<<<<<<< HEAD
Contributions are welcome. Feel free to fork the repository, submit improvements, or open a pull request.
=======
Contributions are welcome. Feel free to fork the repository, improve the project, and submit a Pull Request.
>>>>>>> e65b8f8 (updated forecast.py with comments)

---

# License

<<<<<<< HEAD
This project is released under the MIT License.
=======
This project is open-source and available under the **MIT License**.
>>>>>>> e65b8f8 (updated forecast.py with comments)

---

# Authors

<<<<<<< HEAD
Developed to demonstrate how AI-powered digital twins can support sustainable campus management and improve carbon credit planning through predictive analytics.

The same architecture can be extended to larger environments, including industrial facilities, urban regions, and smart cities, depending on the availability of energy and infrastructure data.
=======
Built with ❤️ to support sustainable campus management, with the motivation of exploring how intelligent carbon monitoring systems can contribute to more effective carbon credit management.

The framework is designed to be scalable beyond university campuses and can be extended to industries, urban regions, and entire cities based on the availability of appropriate infrastructure and data resources.
>>>>>>> e65b8f8 (updated forecast.py with comments)
