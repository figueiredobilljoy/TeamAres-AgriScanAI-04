# AgriScan AI Frontend

React + Vite frontend for the AgriScan AI crop disease detection app.

## Prerequisites

- Node.js installed
- Backend server running at `http://localhost:5000`

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

- The frontend sends crop selection and uploaded image data to `http://localhost:5000/analyze`.
- Start the backend before using the disease detection flow.
