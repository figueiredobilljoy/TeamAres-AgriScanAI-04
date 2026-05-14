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
