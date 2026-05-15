# Deployment Guide

The project is deployed with:

```text
Frontend: Vercel
Backend: Render
```

## Frontend Deployment

Production frontend:

```text
https://team-ares-agri-scan-ai-04.vercel.app
```

Vercel settings:

```text
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Frontend environment variable:

```text
VITE_API_BASE_URL=https://teamares-agriscanai-04.onrender.com
```

The same value is also stored in:

```text
frontend/.env.production
```

After frontend changes:

```bash
git add frontend
git commit -m "Update frontend"
git push
```

Vercel usually redeploys automatically after push.

## Backend Deployment

Production backend:

```text
https://teamares-agriscanai-04.onrender.com
```

Render service type:

```text
Web Service
```

Render settings:

```text
Root Directory: leave blank
Build Command: pip install -r backend/requirements.txt
Start Command: gunicorn backend.app:app --bind 0.0.0.0:$PORT
```

The root directory should stay blank because the backend needs access to:

```text
ai-model/
```

Backend environment variables on Render:

```text
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.5-flash
CORS_ORIGINS=https://team-ares-agri-scan-ai-04.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

Do not commit:

```text
backend/.env
```

After backend changes:

```bash
git add backend ai-model .python-version
git commit -m "Update backend"
git push
```

Render usually redeploys automatically after push.

## Python Version

Render should use the Python version in:

```text
.python-version
```

TensorFlow requires a compatible Python version. If Render fails to install TensorFlow, verify the configured Python version in Render and in `.python-version`.

## Deployment Checks

After backend deployment:

```text
https://teamares-agriscanai-04.onrender.com/health
```

Expected response:

```json
{
  "status": "ok"
}
```

After frontend deployment:

1. Open the Vercel URL.
2. Visit the Detect page.
3. Select a crop.
4. Upload a real leaf image.
5. Run detection.
6. Confirm the result appears.

## Common Issues

### Frontend Cannot Connect To Backend

Check:

```text
VITE_API_BASE_URL
CORS_ORIGINS
backend Render URL
```

### CORS Error

Make sure Render has:

```text
CORS_ORIGINS=https://team-ares-agri-scan-ai-04.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

Do not include a trailing slash in the origin.

### Gemini Advice Not Working

Check Render environment variables:

```text
GEMINI_API_KEY
GEMINI_MODEL_NAME
```

The app still returns fallback advice if Gemini fails.
