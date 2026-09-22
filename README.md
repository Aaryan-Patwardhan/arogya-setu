# ArogyaSetu (आरोग्यसेतु) 🩺
### Multilingual Voice-First Health Triage & District Hospital Locator

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_Flash-8E75B2.svg?logo=google&logoColor=white)](https://aistudio.google.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/Aaryan-Patwardhan/arogya-setu)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**ArogyaSetu** is an AI-powered, voice-first medical triage and hospital locator engineered specifically for district-level healthcare access. Designed for accessibility across urban and rural demographics, it communicates naturally in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

> **Prototype Demo District:** Currently configured for **Latur District**, Maharashtra. Designed with a modular architecture so any district can be deployed by adding its dataset.

---

## 🌟 Key Features

- 🎙️ **Voice-First Input (Speech-to-Text):** Hands-free voice interface using native Web Speech recognition tuned for Indian English (`en-IN`), Hindi (`hi-IN`), and Marathi (`mr-IN`) with automatic silence detection.
- 🔊 **Voice-Aloud Response (Text-to-Speech):** Reads out triage evaluations and guidance in the patient's native dialect.
- 🚨 **Rule-Based Emergency Guardrails:** Sub-millisecond regex scanning for life-threatening symptoms (e.g., chest pain, severe bleeding, unconsciousness). Instantly activates high-contrast SOS emergency banners with one-tap 108 / 112 dialing.
- 🤖 **Empathetic AI Triage (Gemini Flash):** Synthesizes non-diagnostic clinical advice, assesses urgency (`EMERGENCY`, `CONSULT_TODAY`, `HOME_CARE`), and tags relevant hospital specialties.
- 📍 **Intelligent Geo-Locator:** Computes Haversine distances to match patients with the nearest hospital equipped with the required department and 24x7 emergency facilities.
- 🗺️ **One-Tap Actions:** Direct Google Maps turn-by-turn navigation and direct phone calling for immediate ambulance and hospital dispatch.

---

## 🏗️ System Architecture

```text
       ┌────────────────────────┐
       │   Browser / Patient    │
       │ (Voice / Geolocation)  │
       └───────────┬────────────┘
                   │  Web Speech API (STT/TTS) & REST
                   ▼
       ┌────────────────────────┐
       │     React + Vite UI    │
       │  Tailwind CSS & Lucide │
       └───────────┬────────────┘
                   │  HTTP (JSON)
                   ▼
       ┌────────────────────────┐
       │    FastAPI Backend     │
       └─────┬────────────┬─────┘
             │            │
             ▼            ▼
   ┌─────────────────┐  ┌─────────────────────────┐
   │ Safety Regex &  │  │  Haversine Geo Matcher  │
   │ Gemini Flash AI │  │  & Hospital Registry    │
   └─────────────────┘  └─────────────────────────┘
```

---

## 📂 Project Structure

```text
arogya-setu/
├── backend/
│   ├── config.py             # District profiles & system configuration
│   ├── main.py               # FastAPI endpoints (/api/chat, /api/hospitals, /api/health)
│   ├── triage.py             # Regex safety guardrails & Gemini Flash triage
│   ├── geo.py                # Haversine distance calculator & hospital ranker
│   ├── latur_hospitals.json  # Mock Latur hospital database
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── index.html            # Application entry page
│   ├── package.json          # Node dependencies & build scripts
│   ├── vite.config.js        # Vite build configuration
│   ├── tailwind.config.js    # Tailwind styling config
│   └── src/
│       ├── App.jsx           # Main application state and layout
│       ├── components/
│       │   ├── Header.jsx           # App bar & English/हिंदी/मराठी language toggle
│       │   ├── EmergencyBanner.jsx  # SOS alert with instant 108/112 dialer
│       │   ├── VoiceController.jsx  # Mic button with audio waveform animation
│       │   ├── ChatWindow.jsx       # Triage history & TTS read-aloud buttons
│       │   ├── HospitalCard.jsx     # Navigation, click-to-call & department tags
│       │   └── Footer.jsx           # Metadata & copyright
│       └── services/
│           ├── api.js        # Axios client for FastAPI backend
│           └── speech.js     # Web Speech API wrapper for STT & TTS
├── .gitignore
├── LICENSE                   # Apache 2.0 License
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** v18 or higher (v20+ recommended)
- **Google Gemini API Key:** Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

---

### 1. Backend Setup

1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate

   # Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in any text editor and paste your Gemini API key:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ACTIVE_DISTRICT="latur"
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000`. You can inspect the interactive documentation at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. In a new terminal tab, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

### 3. Continuous Deployment on Vercel (Auto-Deploy on Git Push)

The repository includes a root [`vercel.json`](vercel.json) configured for zero-configuration, automated builds.

#### Connecting your GitHub repository to Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New Project"** and select **"Import Git Repository"**.
3. Choose `Aaryan-Patwardhan/arogya-setu`.
4. Vercel automatically detects the Vite framework and root `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
5. *(Optional)* If your backend is hosted online (e.g. on Render, Railway, or Fly.io), add an environment variable in Vercel:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.com`
6. Click **Deploy**.

> **Automatic Sync:** Every time you run `git push origin main`, Vercel immediately triggers a fresh build and updates the live site in seconds with zero extra manual steps!

---

## 🗺️ How to Switch or Add New Districts

ArogyaSetu is engineered to scale across any district without refactoring code.

To switch from the default prototype (**Latur**) to another district (e.g., **Pune**, **Nashik**, or **Nagpur**):

### Step 1: Create the District Dataset
Create a JSON file in `backend/` named `<district>_hospitals.json` (e.g., `backend/pune_hospitals.json`) with this structure:
```json
[
  {
    "id": "pune-general-1",
    "name": "Sassoon General Hospital",
    "name_mr": "ससून सर्वोपचार रुग्णालय",
    "name_hi": "ससून जनरल अस्पताल",
    "lat": 18.5284,
    "lon": 73.8739,
    "address": "Near Pune Railway Station, Pune, Maharashtra 411001",
    "phone": "+91-20-26128000",
    "emergency_24x7": true,
    "available_treatments": ["Emergency", "Trauma", "Cardiology", "ICU"],
    "estimated_cost_tier": "Low/Govt"
  }
]
```

### Step 2: Register District in `backend/config.py`
Add your new district entry to `DISTRICT_PROFILES`:
```python
DISTRICT_PROFILES = {
    "latur": {
        "name": "Latur",
        "state": "Maharashtra",
        "center_lat": 18.4088,
        "center_lon": 76.5604,
        "radius_km": 30.0,
        "data_file": "latur_hospitals.json"
    },
    "pune": {
        "name": "Pune",
        "state": "Maharashtra",
        "center_lat": 18.5204,
        "center_lon": 73.8567,
        "radius_km": 35.0,
        "data_file": "pune_hospitals.json"
    }
}
```

### Step 3: Switch the Active District
In `backend/.env`, set:
```env
ACTIVE_DISTRICT="pune"
```
Restart the backend, and ArogyaSetu will automatically route all triage queries, distance calculations, and hospital results to Pune!

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck, service status, and district metadata |
| `GET` | `/api/hospitals?specialty=&district=` | Retrieve registered hospitals with optional department filtering |
| `POST` | `/api/chat` | Main clinical triage & nearest hospital matching engine |

#### Example Chat Request:
```json
{
  "message": "मला छातीत खूप दुखत आहे आणि श्वास घ्यायला त्रास होतोय",
  "language": "mr",
  "lat": 18.4088,
  "lon": 76.5843
}
```

#### Example Chat Response:
```json
{
  "success": true,
  "triage": {
    "analysis": "Critical cardiac/respiratory warning symptoms reported.",
    "urgency": "EMERGENCY",
    "specialty_needed": "Cardiology",
    "recommended_action": "१०८ रुग्णवाहिकेला कॉल करा, रुग्णाला शांत बसवून ठेवा आणि त्वरित वैद्यकीय मदत मिळवा.",
    "response_text": "गंभीर लक्षणांच्या आधारे ही वैद्यकीय आणीबाणीची परिस्थिती वाटत आहे. कृपया त्वरित नजीकच्या आपत्कालीन विभागात धाव घ्या.",
    "is_emergency": true,
    "disclaimer": "⚠️ अस्वीकरण: आरोग्यसेतु हे एआय-आधारित ट्रायज सहाय्यक आहे..."
  },
  "geo": {
    "district": "Latur",
    "is_fallback_location": false,
    "effective_coordinates": { "lat": 18.4088, "lon": 76.5843 },
    "hospitals": [
      {
        "id": "ashwini-critical-care",
        "name": "Ashwini Hospital & Critical Care Center",
        "distance_km": 1.9,
        "phone": "+91-2382-243222",
        "emergency_24x7": true,
        "navigation_url": "https://www.google.com/maps/dir/?api=1&destination=18.3975,76.571"
      }
    ]
  }
}
```

---

## 🛡️ Clinical & Safety Disclaimer

ArogyaSetu is an educational and hackathon decision-support prototype. It does **not** provide definitive clinical diagnoses or prescribe pharmaceuticals. In any life-threatening emergency, always contact local emergency medical services (**108** or **112**) or visit the nearest hospital emergency room directly.

---

## 📄 License & Attribution

Distributed under the **Apache License 2.0**. See [`LICENSE`](LICENSE) for more information.

Authored by **Aaryan Patwardhan**  
GitHub: [@Aaryan-Patwardhan](https://github.com/Aaryan-Patwardhan)
