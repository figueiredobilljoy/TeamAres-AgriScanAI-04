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

Create `backend/.env` with your Gemini key before running AI advice:

```text
GEMINI_API_KEY=your_api_key_here
```

The backend uses `gemini-2.5-flash` by default. To override it, add:

```text
GEMINI_MODEL_NAME=gemini-2.5-flash
```

The API runs at:

```text
http://localhost:5000
```

The frontend sends uploaded images to:

```text
POST http://localhost:5000/analyze
```

Optional form fields:

```text
latitude=18.5204
longitude=73.8567
```

When coordinates are provided, the backend uses free OpenStreetMap/Nominatim
lookup to suggest nearby agriculture-related stores and pharmacies. If the
lookup fails, disease prediction and Gemini advice still return normally.

## Model

The backend loads the tomato-only Keras model from:

```text
../ai-model/tomato_disease_model.h5
```

The current model outputs 4 tomato classes. If the model was trained with a
different class order, update `TOMATO_CLASSES` in `services/analyzer.py` to
match the training labels.
