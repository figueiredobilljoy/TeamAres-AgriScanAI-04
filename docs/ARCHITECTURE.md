# AgriScan AI Architecture

AgriScan AI is a web-based crop disease detection and advisory platform. It uses a React frontend, a Flask backend, TensorFlow/Keras crop disease models, Gemini AI advisory generation, SQLite community reports, and OpenStreetMap/Nominatim nearby store lookup.

## System Overview

```text
User Browser
    |
    | React + Vite frontend
    | https://team-ares-agri-scan-ai-04.vercel.app
    v
Flask API backend
    |
    | /analyze
    | /community
    | /health
    v
Backend services
    |
    |-- TensorFlow/Keras models in ai-model/
    |-- Gemini API for image validation and advisory text
    |-- SQLite database for local community reports
    `-- Nominatim lookup for nearby agriculture stores
```

## Frontend

The frontend lives in `frontend/` and is built with React, Vite, and Tailwind CSS.

Important files:

```text
frontend/src/App.jsx
frontend/src/pages/HomePage.jsx
frontend/src/pages/DetectPage.jsx
frontend/src/pages/CommunityPage.jsx
frontend/src/components/ResultCard.jsx
frontend/src/config/api.js
```

`frontend/src/config/api.js` reads the backend base URL from:

```text
VITE_API_BASE_URL
```

Production builds use:

```text
frontend/.env.production
```

Current production backend:

```text
https://teamares-agriscanai-04.onrender.com
```

## Backend

The backend lives in `backend/` and is built with Flask.

Important files:

```text
backend/app.py
backend/services/analyzer.py
backend/services/gemini_service.py
backend/services/location_service.py
backend/db/database.py
backend/db/schema.sql
```

The Flask app exposes:

```text
GET  /health
GET  /crops
GET  /community
POST /analyze
```

## Machine Learning Models

Model files live in:

```text
ai-model/
```

Supported crops:

```text
apple
mango
potato
tomato
```

The model mapping and class labels are configured in:

```text
backend/services/analyzer.py
```

When a user uploads an image, the backend:

1. Validates crop and image input.
2. Optionally asks Gemini whether the image looks like a real plant or leaf.
3. Loads the correct Keras `.h5` model.
4. Preprocesses the image.
5. Runs prediction.
6. Selects the top disease and possible alternative.
7. Generates advisory output through Gemini or fallback logic.
8. Stores confident reports for community insights.

## Gemini Integration

Gemini is used by:

```text
backend/services/gemini_service.py
```

It handles:

```text
image validation
severity explanation
causes
treatment advice
prevention tips
multilingual advisory text
```

If Gemini fails or the key is missing, the app still returns local fallback advice.

## Database

The backend uses SQLite for local community reports.

Schema:

```text
backend/db/schema.sql
```

Local database file:

```text
backend/db/reports.db
```

The database file is ignored by git.

## Security

Secrets must stay on the backend only.

Frontend environment:

```text
VITE_API_BASE_URL
```

Backend environment:

```text
GEMINI_API_KEY
GEMINI_MODEL_NAME
CORS_ORIGINS
```

Never commit:

```text
backend/.env
```
