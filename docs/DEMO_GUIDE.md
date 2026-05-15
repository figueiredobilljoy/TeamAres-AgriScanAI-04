# Demo Guide

Use this guide for project review, judging, or presentation demos.

## Live URLs

Frontend:

```text
https://team-ares-agri-scan-ai-04.vercel.app
```

Backend health check:

```text
https://teamares-agriscanai-04.onrender.com/health
```

## Demo Flow

1. Open the frontend URL.
2. Show the Home page and explain the four main capabilities:
   - AI crop disease detection
   - Gemini advisory
   - nearby agriculture stores
   - community disease insights
3. Open the Detect page.
4. Select a crop.
5. Upload a clear leaf image.
6. Choose advisory language if needed.
7. Click Detect Disease.
8. Explain the returned result:
   - crop
   - disease
   - confidence
   - severity
   - causes
   - treatment
   - prevention
9. Open the Community page.
10. Allow location access if available.
11. Show nearby stores and disease insights.

## Good Test Images

Use clear, close-up leaf photos.

Recommended:

```text
single leaf
good lighting
minimal background clutter
visible disease spots or healthy leaf surface
```

Avoid:

```text
cartoon images
selfies
screenshots
vehicles
random non-plant objects
very blurry leaves
```

## Expected Behavior

If the image is valid:

```text
The app predicts a disease and returns advisory guidance.
```

If confidence is moderate or low:

```text
The app shows a confidence disclaimer.
```

If Gemini is unavailable:

```text
The app still returns local fallback advice.
```

If the backend is cold-starting on Render:

```text
The first request may take longer than usual.
```

## Presenter Notes

Core message:

```text
AgriScan AI helps farmers detect crop disease from leaf images and get practical guidance quickly.
```

Technical highlight:

```text
The app combines TensorFlow disease models with Gemini-generated advisory text and community/location-based support.
```

Safety note:

```text
The app gives advisory guidance, but farmers should consult local agricultural experts before using chemical treatments.
```
