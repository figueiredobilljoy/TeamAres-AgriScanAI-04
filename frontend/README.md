# AgriScan AI Frontend

React + Vite frontend for the AgriScan AI crop disease detection app.

## Prerequisites

- Node.js installed
- Backend server running at `https://teamares-agriscanai-04.onrender.com` for production, or `http://localhost:5000` for local development

Optional: create `frontend/.env` from `.env.example` when the backend URL is different:

```text
VITE_API_BASE_URL=https://teamares-agriscanai-04.onrender.com
```

## Start the Development Server

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Notes

- The frontend sends API requests to `VITE_API_BASE_URL`, defaulting to `http://localhost:5000` when no Vite env file is provided.
- Production builds use `frontend/.env.production`, currently set to `https://teamares-agriscanai-04.onrender.com`.
- Start the backend before using the disease detection flow.
