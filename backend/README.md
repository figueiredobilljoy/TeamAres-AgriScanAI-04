# Backend

Flask API for the crop disease detector.

## Run

```cmd
cd /d "C:\Users\Billjoy Figueiredo\OneDrive\Desktop\crop-disease-detector\backend"
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Create `backend/.env` from `.env.example` with your Gemini key before running AI advice:

```text
GEMINI_API_KEY=your_api_key_here
```

The backend uses `gemini-2.5-flash` by default. To override it, add:

```text
GEMINI_MODEL_NAME=gemini-2.5-flash
```

To allow a deployed frontend or a different local Vite port, set comma-separated CORS origins:

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The API runs at:

```text
http://localhost:5000
```

The frontend sends uploaded images to `VITE_API_BASE_URL` plus:

```text
POST /analyze
```

Optional form fields:

```text
latitude=18.5204
longitude=73.8567
```

When coordinates are provided, the backend uses free OpenStreetMap/Nominatim
lookup to suggest nearby agriculture-related stores and pharmacies. If the
lookup fails, disease prediction and Gemini advice still return normally.

## Models

The backend loads Keras models from:

```text
../ai-model/
```

Supported crops and class order are defined in `services/analyzer.py`. If any
model was trained with a different class order, update `MODEL_CONFIGS` to match
the training labels.
