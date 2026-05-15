import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

try:
    from db.database import get_nearby_disease_insights, initialize_database, save_disease_report
    from services.analyzer import analyze_crop_image, get_supported_crops
    from services.location_service import find_nearby_agriculture_stores
except ModuleNotFoundError:
    from backend.db.database import get_nearby_disease_insights, initialize_database, save_disease_report
    from backend.services.analyzer import analyze_crop_image, get_supported_crops
    from backend.services.location_service import find_nearby_agriculture_stores


BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")


def create_app():
    app = Flask(__name__)
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/*": {"origins": cors_origins}})
    initialize_database()

    @app.get("/")
    def index():
        return jsonify(
            {
                "message": "Crop disease detector backend is running.",
                "analyze_endpoint": "/analyze",
            }
        )

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.get("/crops")
    def crops():
        return jsonify({"crops": get_supported_crops()})

    @app.get("/community")
    def community():
        latitude = request.args.get("latitude")
        longitude = request.args.get("longitude")
        stores, stores_error = find_nearby_agriculture_stores(latitude, longitude)
        insights = get_nearby_disease_insights(latitude, longitude)

        return jsonify(
            {
                "nearby_stores": stores,
                "nearby_stores_error": stores_error,
                "disease_insights": insights,
            }
        )

    @app.post("/analyze")
    def analyze():
        crop = request.form.get("crop", "").strip().lower()

        if not crop:
            return jsonify({"error": "Please select a crop type before uploading an image."}), 400

        if "image" not in request.files:
            return jsonify({"error": "No image file was uploaded."}), 400

        image = request.files["image"]

        if not image.filename:
            return jsonify({"error": "Uploaded image must have a filename."}), 400

        if not image.mimetype.startswith("image/"):
            return jsonify({"error": "Uploaded file must be an image."}), 400

        latitude = request.form.get("latitude")
        longitude = request.form.get("longitude")
        language = request.form.get("language", "en").strip().lower()

        try:
            result = analyze_crop_image(image, crop, language)
            result["stored_in_community_reports"] = save_disease_report(
                result["crop"],
                result["disease"],
                result["confidence"],
                latitude,
                longitude,
            )
        except ValueError as error:
            return jsonify({"error": str(error)}), 400
        except Exception as error:
            return jsonify({"error": str(error)}), 500

        return jsonify(result)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
