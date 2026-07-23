# Campus Carbon Pulse

## AI-Powered Digital Twin for Campus Carbon Footprint Monitoring

A real-time 3D visualization platform that predicts and monitors campus-wide carbon emissions using LSTM-based forecasting models. The system provides a digital twin of the campus, enabling interactive visualization of predicted emissions over a 24-hour period.

![Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)

---

## Features

- 🤖 **LSTM-Based Forecasting** – Predicts carbon emissions for the next 24 hours using trained neural network models.
- 🗺️ **Interactive 3D Campus Map** – Visualizes building-wise emissions through dynamic color-coded heat maps.
- 📊 **Live Analytics Dashboard** – Displays real-time campus emission metrics and insights.
- ⏱️ **Time-Based Exploration** – Navigate through hourly predictions using an interactive time slider.
- 🎨 **Modern User Interface** – Glassmorphic design with responsive interactions and smooth animations.

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- MapLibre GL
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- TensorFlow / Keras
- Pandas
- Uvicorn

---

## Installation

### Prerequisites

- Node.js 18+
- npm
- Python 3.8+
- Git

### Clone the Repository

```bash
git clone <your-repository-url>
cd campus-carbon-pulse-main
```

### Frontend Setup

```bash
npm install
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
source venv/bin/activate

pip install -r requirements.txt

python -m uvicorn main:app --reload --port 8000
```

The backend runs at:

```
http://localhost:8000
```

---

## Usage

1. Start the FastAPI backend.
2. Launch the React frontend.
3. Open the application in your browser.
4. Explore campus emissions by:
   - Adjusting the hourly time slider.
   - Clicking on buildings to inspect emission statistics.
   - Observing real-time color transitions based on predicted emission levels.

---

## Project Structure

```text
campus-carbon-pulse-main/
├── backend/
│   ├── models/              # Trained LSTM models (*.keras)
│   ├── main.py              # FastAPI application
│   ├── forecast.py          # Prediction pipeline
│   ├── emissions.json       # Generated 24-hour forecasts
│   ├── campus.json          # GeoJSON building data
│   └── requirements.txt     # Backend dependencies
│
├── src/
│   ├── components/          # React components
│   ├── pages/               # Application pages
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript definitions
│
├── public/
│   └── campus.json          # Static GeoJSON dataset
│
├── package.json
└── vite.config.ts
```

---

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

### `GET /get-emissions/{hour}`

Returns the predicted carbon emissions for all campus buildings at a specified hour (0–23).

### Sample Response

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

## Contributing

Contributions are welcome. Feel free to fork the repository, submit improvements, or open a pull request.

---

## License

This project is released under the MIT License.

---

## Authors

Developed to demonstrate how AI-powered digital twins can support sustainable campus management and improve carbon credit planning through predictive analytics.

The same architecture can be extended to larger environments, including industrial facilities, urban regions, and smart cities, depending on the availability of energy and infrastructure data.
