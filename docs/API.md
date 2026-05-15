# AgriScan AI API

Production backend:

```text
https://teamares-agriscanai-04.onrender.com
```

Local backend:

```text
http://localhost:5000
```

## Health Check

```text
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

## Supported Crops

```text
GET /crops
```

Example response:

```json
{
  "crops": [
    { "id": "apple", "name": "Apple" },
    { "id": "mango", "name": "Mango" },
    { "id": "potato", "name": "Potato" },
    { "id": "tomato", "name": "Tomato" }
  ]
}
```

## Analyze Crop Image

```text
POST /analyze
```

Request type:

```text
multipart/form-data
```

Required fields:

```text
crop    apple | mango | potato | tomato
image   uploaded image file
```

Optional fields:

```text
language   en | hi | mr
latitude   decimal coordinate
longitude  decimal coordinate
```

Example successful response:

```json
{
  "crop": "Tomato",
  "disease": "Tomato Leaf Mold",
  "confidence": "87.42%",
  "alternative_disease": "Tomato Early blight",
  "alternative_confidence": "8.13%",
  "disclaimer": "",
  "severity": "High",
  "causes": [
    "Leaf mold commonly spreads in humid, poorly ventilated tomato canopies."
  ],
  "treatment": [
    "Improve airflow and use locally recommended fungicide if symptoms spread."
  ],
  "prevention": [
    "Avoid overhead watering and remove infected leaves early."
  ],
  "stored_in_community_reports": true
}
```

Example error response:

```json
{
  "error": "Please select a crop type before uploading an image."
}
```

## Community Data

```text
GET /community?latitude=18.5204&longitude=73.8567
```

Example response:

```json
{
  "nearby_stores": [
    {
      "name": "Agriculture Store",
      "address": "Address not available",
      "distance_km": 1.25
    }
  ],
  "nearby_stores_error": "",
  "disease_insights": [
    {
      "crop": "Tomato",
      "disease": "Tomato Leaf Mold",
      "count": 2,
      "average_distance_km": 1.8,
      "message": "Tomato Leaf Mold has multiple recent nearby reports"
    }
  ]
}
```

## CORS

The backend allows requests from origins listed in:

```text
CORS_ORIGINS
```

Current frontend origin:

```text
https://team-ares-agri-scan-ai-04.vercel.app
```
