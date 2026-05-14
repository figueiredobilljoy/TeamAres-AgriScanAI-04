def analyze_crop_image(image_file):
    """Return a mock result until the trained AI model is connected."""
    image_file.stream.seek(0, 2)
    image_size = image_file.stream.tell()
    image_file.stream.seek(0)

    return {
        "crop": "Tomato",
        "disease": "Early Blight",
        "confidence": "92%",
        "severity": "Medium",
        "advice": "Apply fungicide and remove infected leaves.",
        "filename": image_file.filename,
        "size_bytes": image_size,
    }
