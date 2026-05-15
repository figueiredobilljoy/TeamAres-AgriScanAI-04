# TeamAres-AgriScanAI-04

AI-powered crop disease detection and advisory platform for helping farmers identify plant diseases from crop leaf images and receive useful treatment guidance.

## Project Name

AgriScan AI

## Team Name

Team Ares

## Problem Statement

AI-Powered Crop Disease Detection + Advisory

## Team Members

- Billjoy Figueiredo
- Kartik Gharse
- Aurick Pereira

## Project Description

AgriScan AI is a web-based crop disease detection system. Users can upload a crop leaf image, and the application analyzes the image using an AI model to predict possible crop disease conditions. The system is designed to provide disease insights, severity information, and advisory guidance so that farmers or agricultural users can take faster action.

## Features

- Upload crop leaf images through a web interface
- Preview selected crop image before analysis
- Analyze uploaded image through a backend API
- Predict crop disease using trained AI models for apple, mango, potato, and tomato
- Display disease result, severity, and Gemini-powered treatment/advisory guidance
- Store anonymized nearby disease reports for community insights
- Simple and responsive user interface

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Flask, Flask-CORS
- AI/ML: TensorFlow, Keras `.h5` models, NumPy, Pillow
- AI advice: Google Gemini through `google-generativeai`
- Database: SQLite for local community disease reports
- Nearby stores: OpenStreetMap/Nominatim lookup

## Project Structure

```text
TeamAres-AgriScanAI-04/
|-- ai-model/
|   |-- apple_disease_model.h5
|   |-- mango_disease_model.h5
|   |-- potato_disease_model.h5
|   `-- tomato_disease_model.h5
|-- backend/
|   |-- app.py
|   |-- .env.example
|   |-- requirements.txt
|   |-- db/
|   `-- services/
|-- docs/
|-- frontend/
|   |-- .env.example
|   |-- package.json
|   `-- src/
|-- README.md
`-- LICENSE
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```text
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Create `frontend/.env` from `frontend/.env.example` if the backend is not running on the default URL:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Real `.env` files are ignored by git. Do not commit API keys.

## Installation Steps

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs on:

```text
http://127.0.0.1:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Usage Instructions

1. Start the backend server.
2. Start the frontend development server.
3. Open the frontend URL in a browser.
4. Upload a crop leaf image.
5. Click the analyze button.
6. View the disease prediction and advisory result.

## Screenshots

To be added.

## Demo Video

To be added.

## Future Scope

- Add support for more crops and disease classes
- Improve advisory recommendations with localized treatment suggestions
- Add user history and report download support
- Add multilingual farmer-friendly guidance
- Deploy the frontend and backend online
