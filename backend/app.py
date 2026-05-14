from flask import Flask, jsonify, request
from flask_cors import CORS

from services.analyzer import analyze_crop_image


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

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

    @app.post("/analyze")
    def analyze():
        if "image" not in request.files:
            return jsonify({"error": "No image file was uploaded."}), 400

        image = request.files["image"]

        if not image.filename:
            return jsonify({"error": "Uploaded image must have a filename."}), 400

        if not image.mimetype.startswith("image/"):
            return jsonify({"error": "Uploaded file must be an image."}), 400

        result = analyze_crop_image(image)
        return jsonify(result)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
