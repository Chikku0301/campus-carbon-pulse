# 🚀 Campus Carbon Pulse – Complete Setup Guide

This guide walks you through the complete installation and execution process for **Campus Carbon Pulse**, from setting up the development environment to running the application successfully.

---

# 📋 Prerequisites

Before getting started, ensure the following software is installed on your system.

## Required Software

- **Node.js** (v18 or later)
- **Python** (v3.8 or later)
- **Git** _(optional, if cloning the repository)_

## Verify Your Installation

Open a terminal or command prompt and run:

```bash
node --version
npm --version
python --version
```

Expected versions:

- Node.js **v18+**
- npm **v9+**
- Python **v3.8+**

---

# 📥 Step 1: Obtain the Project

## Option A – Clone the Repository

```bash
git clone <repository-url>
cd campus-carbon-pulse-main
```

## Option B – Download the ZIP

1. Download the project ZIP file.
2. Extract it to your preferred location.
3. Open a terminal in the extracted project directory.

---

# 🎨 Step 2: Frontend Setup (React + Vite)

## Install Dependencies

Ensure you are inside the project root directory.

```bash
npm install
```

This command installs all required frontend dependencies, including React, Vite, MapLibre GL, and related packages.

> Installation may take a few minutes depending on your internet connection.

## Verify Installation

After completion, confirm that the `node_modules/` directory has been created.

---

# 🐍 Step 3: Backend Setup (Python + FastAPI)

## Navigate to the Backend Directory

```bash
cd backend
```

---

## Create a Virtual Environment

### Windows

```bash
python -m venv venv
```

### macOS / Linux

```bash
python3 -m venv venv
```

---

## Activate the Virtual Environment

### Windows (Command Prompt)

```bash
venv\Scripts\activate
```

### Windows (PowerShell)

```bash
venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source venv/bin/activate
```

Once activated, your terminal should display:

```text
(venv)
```

---

## Install Backend Dependencies

```bash
pip install -r requirements.txt
```

This installs all required backend libraries, including:

- FastAPI
- TensorFlow
- Pandas
- Uvicorn
- Other project dependencies

> The installation may take several minutes.

---

## Verify Backend Files

Ensure the following files are present inside the `backend/` directory:

- ✅ `main.py`
- ✅ `forecast.py`
- ✅ `emissions.json`
- ✅ `campus.json`
- ✅ `models/` directory containing the trained `.keras` models

---

# ▶️ Step 4: Run the Application

The application requires **two terminal windows** running simultaneously.

---

## Terminal 1 – Start the Backend Server

```bash
cd backend

# Activate the virtual environment

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

python -m uvicorn main:app --reload --port 8000
```

Expected output:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ Backend server is now running at:

```
http://localhost:8000
```

---

## Terminal 2 – Start the Frontend Server

Open a **new terminal** while keeping the backend running.

```bash
cd campus-carbon-pulse-main
npm run dev
```

Expected output:

```text
VITE v5.x.x ready

Local: http://localhost:8080/
```

✅ Frontend server is now running at:

```
http://localhost:8080
```

---

# 🌐 Step 5: Open the Application

Open your browser and navigate to:

```
http://localhost:8080
```

You should see:

- 3D Campus Map
- Time Slider
- "Campus Twin" Dashboard
- Real-time Carbon Emission Visualization

---

# 🎮 Step 6: Verify Functionality

## Test the Time Slider

Move the slider between **Hour 0** and **Hour 23**.

Expected behavior:

- Building colors update dynamically.
- Total emission values change.
- Heat levels adjust accordingly.

---

## Test Building Information

Click any building on the campus map.

The popup should display:

- Building Name
- Heat Level (%)
- Carbon Emission (kg/h)
- Building Height (m)

---

## Test the Backend API

Open the following URL in your browser:

```
http://localhost:8000/get-emissions/10
```

A JSON response containing predicted emission values should be returned.

---

# 🛑 Stopping the Application

## Stop the Frontend

Press:

```text
Ctrl + C
```

in the frontend terminal.

---

## Stop the Backend

Press:

```text
Ctrl + C
```

in the backend terminal.

---

## Deactivate the Virtual Environment

```bash
deactivate
```

---

# 🔄 Running the Project Again

After the initial setup, starting the project only requires two commands.

## Backend

```bash
cd backend

# Activate virtual environment

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

python -m uvicorn main:app --reload --port 8000
```

---

## Frontend

```bash
cd campus-carbon-pulse-main
npm run dev
```

---

# 🐛 Troubleshooting

## Port 8000 Already in Use

### Windows

```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### macOS / Linux

```bash
lsof -ti:8000 | xargs kill -9
```

---

## Port 8080 Already in Use

Edit `vite.config.ts`:

```typescript
server: {
  port: 3000;
}
```

Choose any available port.

---

## Module Not Found Errors

### Frontend

```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend

```bash
pip install -r requirements.txt --force-reinstall
```

---

## Virtual Environment Not Activating (Windows)

Run PowerShell as Administrator:

```bash
Set-ExecutionPolicy RemoteSigned
```

---

## Map Not Loading

Verify the following:

- Backend server is running.
- `public/campus.json` exists.
- Browser console (F12) shows no errors.

---

## Building Colors Not Updating

Verify:

- `backend/emissions.json` exists.
- Backend API is responding.
- Browser cache has been cleared (`Ctrl + Shift + R`).

---

# 📊 Project Architecture

```text
Browser (http://localhost:8080)
│
├── React Frontend
│   ├── 3D Campus Map (MapLibre)
│   ├── Dashboard
│   ├── Time Slider
│   └── UI Components
│
│
├── HTTP Request
│   GET /get-emissions/{hour}
│
▼
Backend (http://localhost:8000)
│
├── FastAPI Server
│   ├── main.py
│   ├── forecast.py
│   ├── emissions.json
│   └── models/*.keras
│
└── Returns predicted emissions to the frontend
```

---

# 🎯 Next Steps

Once the application is running, you can:

- Explore emission forecasts across different hours.
- Inspect individual buildings for detailed metrics.
- Access the interactive API documentation at:

```
http://localhost:8000/docs
```

- Modify the campus layout by editing `public/campus.json`.
- Retrain the LSTM models using updated historical data.

---

# 💡 Tips

- Keep **both terminals running** while using the application.
- The backend automatically reloads when Python files are modified.
- The frontend supports hot reloading for React and TypeScript changes.
- Use the browser developer console (**F12**) to debug frontend issues.
- FastAPI automatically generates API documentation at `/docs`.

---

# 📞 Need Assistance?

If you encounter any issues:

1. Review the troubleshooting section.
2. Verify all prerequisites are installed correctly.
3. Ensure both frontend and backend servers are running.
4. Check terminal logs and browser console for error messages.

---

## 🌍 Happy Monitoring!

Thank you for using **Campus Carbon Pulse**. We hope this platform helps demonstrate the potential of intelligent digital twins for sustainable carbon monitoring and management.
