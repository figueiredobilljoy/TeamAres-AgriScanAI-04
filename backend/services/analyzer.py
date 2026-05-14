from functools import lru_cache
from pathlib import Path

import h5py
import numpy as np
from PIL import Image
from tensorflow.keras import Sequential
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import load_model


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "ai-model"

MODEL_CONFIGS = {
    "apple": {
        "label": "Apple",
        "path": MODEL_DIR / "apple_disease_model.h5",
        "classes": [
            "Apple scab",
            "Apple Black rot",
            "Apple Cedar apple rust",
            "Apple healthy",
        ],
    },
    "mango": {
        "label": "Mango",
        "path": MODEL_DIR / "mango_disease_model.h5",
        "classes": [
            "Mango Anthracnose",
            "Mango Bacterial Canker",
            "Mango Cutting Weevil",
            "Mango Die Back",
            "Mango Gall Midge",
            "Mango healthy",
            "Mango Powdery Mildew",
            "Mango Sooty Mould",
        ],
    },
    "potato": {
        "label": "Potato",
        "path": MODEL_DIR / "potato_disease_model.h5",
        "classes": [
            "Potato Fungal",
            "Potato Early blight",
            "Potato healthy",
            "Potato Late blight",
            "Potato Nematode",
            "Potato Pests",
            "Potato Virus",
        ],
    },
    "tomato": {
        "label": "Tomato",
        "path": MODEL_DIR / "tomato_disease_model.h5",
        "classes": [
            "Tomato Leaf Mold",
            "Tomato Early blight",
            "Tomato Late blight",
            "Tomato healthy",
        ],
    },
}

TREATMENT_ADVICE = {
    "Apple scab": "Remove fallen leaves, prune for airflow, and apply a recommended apple scab fungicide during wet weather.",
    "Apple Black rot": "Prune infected branches, remove mummified fruit, and keep the orchard floor clean to reduce spores.",
    "Apple Cedar apple rust": "Remove nearby cedar galls where possible and use a rust-control fungicide during early leaf growth.",
    "Apple healthy": "The leaf appears healthy. Keep monitoring, water consistently, and maintain good airflow.",
    "Mango Anthracnose": "Prune infected shoots, remove diseased debris, and use a suitable copper or systemic fungicide as advised locally.",
    "Mango Bacterial Canker": "Remove infected plant parts, avoid injuries to branches, and apply copper-based protection if recommended.",
    "Mango Cutting Weevil": "Remove affected shoots and fruit, keep the orchard clean, and consult local guidance for approved insect control.",
    "Mango Die Back": "Prune dead twigs below the infected area, sterilize tools, and improve tree nutrition and drainage.",
    "Mango Gall Midge": "Remove infested leaves or shoots and use locally recommended pest management during active infestation.",
    "Mango healthy": "The leaf appears healthy. Keep monitoring, avoid water stress, and maintain orchard sanitation.",
    "Mango Powdery Mildew": "Improve airflow, remove heavily infected growth, and apply a sulfur or labeled fungicide if symptoms spread.",
    "Mango Sooty Mould": "Control sap-sucking insects, wash residue from leaves, and improve canopy airflow.",
    "Potato Fungal": "Remove infected foliage, improve airflow, avoid overhead watering, and use a locally recommended fungicide if symptoms spread.",
    "Potato Early blight": "Remove infected foliage, avoid overhead watering, and apply a labeled fungicide when conditions favor spread.",
    "Potato healthy": "The leaf appears healthy. Keep monitoring, water at the base, and maintain crop rotation.",
    "Potato Late blight": "Remove severely infected plants, keep foliage dry, and apply a late-blight fungicide promptly.",
    "Potato Nematode": "Use certified seed, rotate with non-host crops, and consider resistant varieties for future planting.",
    "Potato Pests": "Inspect leaf undersides, remove visible pests, and use locally approved pest control only when needed.",
    "Potato Virus": "Remove infected plants, control aphids, and use certified disease-free seed potatoes.",
    "Tomato Bacterial spot": "Remove infected leaves, avoid overhead watering, and use a copper-based bactericide if symptoms continue.",
    "Tomato Early blight": "Prune infected foliage, mulch around the plant, and apply a labeled fungicide for early blight control.",
    "Tomato Late blight": "Remove badly infected plants, keep foliage dry, and apply a late-blight fungicide promptly.",
    "Tomato Leaf Mold": "Improve airflow, reduce humidity around plants, and use a suitable fungicide if the infection spreads.",
    "Tomato Septoria leaf spot": "Remove spotted leaves, avoid splashing soil onto foliage, and apply a protective fungicide.",
    "Tomato Spider mites Two-spotted spider mite": "Rinse leaf undersides, reduce plant stress, and use insecticidal soap or miticide when mites are active.",
    "Tomato Target Spot": "Remove infected debris, improve spacing, and apply a recommended fungicide for target spot.",
    "Tomato Tomato Yellow Leaf Curl Virus": "Remove infected plants, control whiteflies, and use resistant varieties for future plantings.",
    "Tomato Tomato mosaic virus": "Remove infected plants, disinfect tools, and avoid handling plants after tobacco exposure.",
    "Tomato healthy": "The leaf appears healthy. Keep monitoring, water at the base, and maintain good airflow.",
}


def get_supported_crops():
    return [
        {"id": crop_id, "name": config["label"]}
        for crop_id, config in MODEL_CONFIGS.items()
    ]


def get_model_config(crop):
    crop_id = crop.strip().lower()

    if crop_id not in MODEL_CONFIGS:
        supported = ", ".join(config["label"] for config in MODEL_CONFIGS.values())
        raise ValueError(f"Unsupported crop type. Please choose one of: {supported}.")

    return crop_id, MODEL_CONFIGS[crop_id]


@lru_cache(maxsize=None)
def get_model(crop):
    _, config = get_model_config(crop)
    model_path = config["path"]

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found at {model_path}")

    try:
        return load_model(model_path, compile=False)
    except ValueError as error:
        if "expects 1 input(s), but it received 2 input tensors" not in str(error):
            raise

        return load_legacy_mobilenetv2_model(config)


def load_legacy_mobilenetv2_model(config):
    model = Sequential(
        [
            MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3)),
            GlobalAveragePooling2D(name="global_average_pooling2d"),
            Dropout(0.3, name="dropout"),
            Dense(128, activation="relu", name="dense"),
            Dense(len(config["classes"]), activation="softmax", name="dense_1"),
        ],
        name="sequential",
    )

    load_h5_weights_by_name(model, config["path"])
    return model


def load_h5_weights_by_name(model, model_path):
    with h5py.File(model_path, "r") as file:
        weights_group = file["model_weights"]

        for layer in model.layers:
            if layer.name not in weights_group:
                continue

            layer_group = weights_group[layer.name]

            if hasattr(layer, "layers"):
                load_nested_layer_weights(layer, layer_group)
            else:
                set_layer_weights_from_group(layer, layer_group)


def load_nested_layer_weights(model, weights_group):
    for layer in model.layers:
        if layer.name in weights_group:
            set_layer_weights_from_group(layer, weights_group[layer.name])


def set_layer_weights_from_group(layer, weights_group):
    if not layer.weights:
        return

    weights = []

    for weight in layer.weights:
        weight_name = get_weight_name(weight)
        dataset_path = get_weight_dataset_path(weights_group, layer.name, weight_name)

        if dataset_path is None:
            return

        weights.append(np.asarray(weights_group[dataset_path]))

    layer.set_weights(weights)


def get_weight_dataset_path(weights_group, layer_name, weight_name):
    if weight_name in weights_group:
        return weight_name

    for saved_name in weights_group.attrs.get("weight_names", []):
        saved_name = saved_name.decode("utf-8") if isinstance(saved_name, bytes) else saved_name

        if saved_name.endswith(f"/{layer_name}/{weight_name}"):
            return saved_name

    return None


def get_weight_name(weight):
    path = getattr(weight, "path", weight.name)
    return path.rsplit("/", 1)[-1].split(":", 1)[0]


def analyze_crop_image(image_file, crop):
    crop_id, config = get_model_config(crop)
    image_file.stream.seek(0, 2)
    image_size = image_file.stream.tell()
    image_file.stream.seek(0)

    model = get_model(crop_id)
    input_size = get_model_input_size(model)
    image_array = preprocess_image(image_file.stream, input_size)
    predictions = normalize_predictions(model.predict(image_array, verbose=0)[0])

    class_index = int(np.argmax(predictions))
    confidence = float(predictions[class_index])
    disease = get_class_name(config, class_index)

    return {
        "crop": config["label"],
        "disease": disease,
        "confidence": f"{confidence * 100:.2f}%",
        "severity": get_severity(disease, confidence),
        "advice": TREATMENT_ADVICE.get(
            disease,
            "Consult a local agricultural expert for crop-specific treatment guidance.",
        ),
        "filename": image_file.filename,
        "size_bytes": image_size,
    }


def get_model_input_size(model):
    input_shape = getattr(model, "input_shape", None)

    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    if input_shape and len(input_shape) >= 3:
        height = input_shape[1]
        width = input_shape[2]

        if height and width:
            return int(width), int(height)

    return 224, 224


def preprocess_image(image_stream, input_size):
    image = Image.open(image_stream).convert("RGB")
    image = image.resize(input_size)
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def normalize_predictions(predictions):
    predictions = np.asarray(predictions, dtype=np.float32)

    if np.any(predictions < 0) or np.any(predictions > 1) or not np.isclose(
        np.sum(predictions),
        1.0,
        atol=0.01,
    ):
        exp_predictions = np.exp(predictions - np.max(predictions))
        return exp_predictions / np.sum(exp_predictions)

    return predictions


def get_class_name(config, class_index):
    if class_index >= len(config["classes"]):
        return f"{config['label']} class {class_index}"

    return config["classes"][class_index]


def get_severity(disease, confidence):
    if "healthy" in disease.lower():
        return "None"

    if confidence >= 0.85:
        return "High"

    if confidence >= 0.6:
        return "Medium"

    return "Low"
