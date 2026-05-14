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
- Predict crop disease using a trained AI model
- Display disease result, severity, and treatment/advisory guidance
- Simple and responsive user interface

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Flask, Flask-CORS
- AI/ML: TensorFlow, Keras `.h5` model, NumPy, Pillow
- Database: Not added yet
- Model: Tomato disease detection model

## Project Structure

```text
TeamAres-AgriScanAI-04/
|-- ai-model/
|   `-- tomato_disease_model.h5
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   `-- services/
|-- docs/
|-- frontend/
|   |-- package.json
|   `-- src/
|-- README.md
`-- LICENSE
```

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
