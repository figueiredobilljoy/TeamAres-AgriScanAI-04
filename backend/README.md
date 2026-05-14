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

The API runs at:

```text
http://localhost:5000
```

The frontend sends uploaded images to:

```text
POST http://localhost:5000/analyze
```

## Model

The backend loads the tomato-only Keras model from:

```text
../ai-model/tomato_disease_model.h5
```

The current model outputs 4 tomato classes. If the model was trained with a
different class order, update `TOMATO_CLASSES` in `services/analyzer.py` to
match the training labels.
