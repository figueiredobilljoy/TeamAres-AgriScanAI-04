import json
import logging
import os
from pathlib import Path

import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL_NAMES = (
    "gemini-flash-latest",
    "gemini-2.0-flash",
)
LOGGER = logging.getLogger(__name__)
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
}
DEFAULT_LANGUAGE = "en"
CONFIDENCE_DISCLAIMERS = {
    "en": {
        "moderate": (
            "Prediction confidence is moderate. Results may be less accurate under complex "
            "lighting or background conditions."
        ),
        "low": (
            "Prediction confidence is low. Please upload a clearer close-up image of a "
            "single leaf for a more reliable diagnosis."
        ),
    },
    "hi": {
        "moderate": (
            "\u092a\u0942\u0930\u094d\u0935\u093e\u0928\u0941\u092e\u093e\u0928 \u0915\u093e \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u092e\u0927\u094d\u092f\u092e \u0939\u0948\u0964 \u091c\u091f\u093f\u0932 \u0930\u094b\u0936\u0928\u0940 \u092f\u093e \u092a\u0943\u0937\u094d\u0920\u092d\u0942\u092e\u093f \u0915\u0940 \u0938\u094d\u0925\u093f\u0924\u093f\u092f\u094b\u0902 \u092e\u0947\u0902 "
            "\u092a\u0930\u093f\u0923\u093e\u092e \u0915\u092e \u0938\u091f\u0940\u0915 \u0939\u094b \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
        ),
        "low": (
            "\u092a\u0942\u0930\u094d\u0935\u093e\u0928\u0941\u092e\u093e\u0928 \u0915\u093e \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u0915\u092e \u0939\u0948\u0964 \u0905\u0927\u093f\u0915 \u0935\u093f\u0936\u094d\u0935\u0938\u0928\u0940\u092f \u0928\u093f\u0926\u093e\u0928 \u0915\u0947 \u0932\u093f\u090f \u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0938\u094d\u092a\u0937\u094d\u091f "
            "\u092a\u0924\u094d\u0924\u0947 \u0915\u0940 \u0915\u094d\u0932\u094b\u091c\u093c-\u0905\u092a \u0924\u0938\u094d\u0935\u0940\u0930 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902\u0964"
        ),
    },
    "mr": {
        "moderate": (
            "\u0905\u0902\u0926\u093e\u091c\u093e\u091a\u093e \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u092e\u0927\u094d\u092f\u092e \u0906\u0939\u0947. \u0915\u0920\u0940\u0923 \u092a\u094d\u0930\u0915\u093e\u0936 \u0915\u093f\u0902\u0935\u093e \u092a\u093e\u0930\u094d\u0936\u094d\u0935\u092d\u0942\u092e\u0940\u091a\u094d\u092f\u093e \u092a\u0930\u093f\u0938\u094d\u0925\u093f\u0924\u0940\u0924 "
            "\u0928\u093f\u0915\u093e\u0932 \u0915\u092e\u0940 \u0905\u091a\u0942\u0915 \u0905\u0938\u0942 \u0936\u0915\u0924\u093e\u0924."
        ),
        "low": (
            "\u0905\u0902\u0926\u093e\u091c\u093e\u091a\u093e \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u0915\u092e\u0940 \u0906\u0939\u0947. \u0905\u0927\u093f\u0915 \u0935\u093f\u0936\u094d\u0935\u093e\u0938\u093e\u0930\u094d\u0939 \u0928\u093f\u0926\u093e\u0928\u093e\u0938\u093e\u0920\u0940 \u0915\u0943\u092a\u092f\u093e \u090f\u0915\u093e \u092a\u093e\u0928\u093e\u091a\u093e "
            "\u0938\u094d\u092a\u0937\u094d\u091f \u091c\u0935\u0933\u091a\u093e \u092b\u094b\u091f\u094b \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u093e."
        ),
    },
}


def get_confidence_disclaimer(confidence, language=DEFAULT_LANGUAGE):
    confidence_percent = confidence * 100

    if confidence_percent >= 70:
        return ""

    disclaimers = CONFIDENCE_DISCLAIMERS.get(language, CONFIDENCE_DISCLAIMERS[DEFAULT_LANGUAGE])

    if confidence_percent >= 50:
        return disclaimers["moderate"]

    return disclaimers["low"]


def get_supported_languages():
    return [
        {"code": code, "name": name}
        for code, name in SUPPORTED_LANGUAGES.items()
    ]


def validate_language(language):
    if language and language in SUPPORTED_LANGUAGES:
        return language
    return DEFAULT_LANGUAGE


def validate_image_is_plant(image_file):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return

    try:
        genai.configure(api_key=api_key)
        img = Image.open(image_file.stream)
        
        prompt = """
You are an image validation system for a crop disease detection app.
Look at this image and determine if it contains a real crop, plant, or leaf that is suitable for disease detection.
Invalid examples: anime/cartoon images, people/selfies, football cards, random screenshots, vehicles, non-plant objects.
Valid examples: close-up crop leaves, diseased leaves, healthy leaves, real plant foliage.

Return ONLY a JSON response with this exact structure:
{
    "is_valid": true or false,
    "reason": "short reason"
}
"""

        for model_name in get_candidate_model_names():
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    [prompt, img],
                    generation_config={
                        "temperature": 0.1,
                        "response_mime_type": "application/json",
                    },
                    request_options={"timeout": 15},
                )
                
                result = parse_gemini_response(response.text)
                if not result.get("is_valid", True):
                    raise ValueError("Please upload a clear crop leaf image for disease detection.")
                
                break
            except ValueError:
                raise
            except Exception as e:
                LOGGER.warning("Gemini vision validation failed for model %s: %s", model_name, e)
                continue

    except ValueError:
        raise
    except Exception as e:
        LOGGER.warning("Image validation encountered an error: %s", e)
    finally:
        image_file.stream.seek(0)


def get_crop_advice(crop, disease, confidence, fallback_treatment, language=DEFAULT_LANGUAGE):
    fallback_advice = build_fallback_advice(disease, confidence, fallback_treatment)
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        LOGGER.warning("Gemini API key is missing. Returning fallback crop advice.")
        return fallback_advice

    try:
        genai.configure(api_key=api_key)
        advice = generate_advice_with_available_model(crop, disease, confidence, language)
        return normalize_advice(advice, fallback_advice)
    except Exception as error:
        LOGGER.warning("Gemini advice generation failed: %s", error)
        return fallback_advice


def generate_advice_with_available_model(crop, disease, confidence, language=DEFAULT_LANGUAGE):
    prompt = build_prompt(crop, disease, confidence, language)
    errors = []

    for model_name in get_candidate_model_names():
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "response_mime_type": "application/json",
                },
                request_options={"timeout": 20},
            )
            return parse_gemini_response(response.text)
        except Exception as error:
            errors.append(f"{model_name}: {error}")
            LOGGER.warning("Gemini model %s failed: %s", model_name, error)

    raise RuntimeError("; ".join(errors))


def get_candidate_model_names():
    model_names = [GEMINI_MODEL_NAME]

    for model_name in GEMINI_FALLBACK_MODEL_NAMES:
        if model_name not in model_names:
            model_names.append(model_name)

    return model_names


def build_prompt(crop, disease, confidence, language=DEFAULT_LANGUAGE):
    confidence_percent = confidence * 100
    language_name = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE])

    language_instruction = ""
    if language != "en":
        language_instruction = (
            f"\nIMPORTANT: Write these text values (causes, treatment, prevention) "
            f"in {language_name}. Keep the 'severity' value and all JSON keys in English. "
            f"Only the values for causes, treatment, and prevention should be in {language_name}.\n"
        )

    return f"""
You are helping a farmer understand a crop disease prediction.

Prediction details:
- Crop: {crop}
- Disease: {disease}
- Confidence: {confidence_percent:.2f}%
{language_instruction}
Return only valid JSON with this exact structure:
{{
  "severity": "None, Low, Medium, or High",
  "causes": ["short farmer-friendly cause"],
  "treatment": ["short practical treatment step"],
  "prevention": ["short prevention tip"]
}}

Keep every item concise, practical, and safe. Recommend consulting a local
agricultural expert for chemical use or severe spread. If the crop appears
healthy, keep severity as "None" and give monitoring/prevention guidance.
"""


def parse_gemini_response(response_text):
    if not response_text:
        raise ValueError("Gemini returned an empty response.")

    cleaned_text = response_text.strip()

    if cleaned_text.startswith("```"):
        cleaned_text = cleaned_text.strip("`").strip()
        if cleaned_text.lower().startswith("json"):
            cleaned_text = cleaned_text[4:].strip()

    return json.loads(cleaned_text)


def normalize_advice(advice, fallback_advice):
    return {
        "severity": normalize_text(advice.get("severity"), fallback_advice["severity"]),
        "causes": normalize_list(advice.get("causes"), fallback_advice["causes"]),
        "treatment": normalize_list(advice.get("treatment"), fallback_advice["treatment"]),
        "prevention": normalize_list(advice.get("prevention"), fallback_advice["prevention"]),
    }


def normalize_text(value, fallback):
    if isinstance(value, str) and value.strip():
        return value.strip()

    return fallback


def normalize_list(value, fallback):
    if not isinstance(value, list):
        return fallback

    clean_items = [str(item).strip() for item in value if str(item).strip()]
    return clean_items or fallback


def build_fallback_advice(disease, confidence, fallback_treatment):
    return {
        "severity": get_fallback_severity(disease, confidence),
        "causes": get_fallback_causes(disease),
        "treatment": [fallback_treatment],
        "prevention": get_fallback_prevention(disease),
    }


def get_fallback_severity(disease, confidence):
    if "healthy" in disease.lower():
        return "None"

    if confidence >= 0.85:
        return "High"

    if confidence >= 0.6:
        return "Medium"

    return "Low"


def get_fallback_causes(disease):
    disease_name = disease.lower()

    if "healthy" in disease.lower():
        return ["No visible disease symptoms were detected in the uploaded leaf image."]

    if "leaf mold" in disease_name:
        return [
            "Leaf mold commonly spreads in humid, poorly ventilated tomato canopies.",
            "Wet leaves and dense plant spacing can help the fungus multiply.",
        ]

    if "early blight" in disease_name:
        return [
            "Early blight often comes from infected crop debris or contaminated soil splash.",
            "Plant stress, older leaves, and warm humid weather can make symptoms worse.",
        ]

    if "late blight" in disease_name:
        return [
            "Late blight spreads quickly in cool, wet weather through airborne spores.",
            "Nearby infected plants and wet foliage can increase disease pressure.",
        ]

    if "sooty mould" in disease_name or "sooty mold" in disease_name:
        return [
            "Sooty mould grows on sticky honeydew left by sap-sucking insects.",
            "Whiteflies, aphids, mealybugs, or scale insects often trigger the problem.",
        ]

    if "powdery mildew" in disease_name:
        return [
            "Powdery mildew is favored by dry leaves, humid air, and crowded growth.",
            "Poor airflow can allow the white fungal growth to spread across young tissue.",
        ]

    if "anthracnose" in disease_name:
        return [
            "Anthracnose spreads through fungal spores during warm, wet conditions.",
            "Rain splash, infected debris, and wounds can help the infection enter plant tissue.",
        ]

    if "bacterial" in disease_name or "canker" in disease_name:
        return [
            "Bacterial diseases often spread through splashing water, wounds, or infected tools.",
            "Humid weather and handling wet plants can increase spread.",
        ]

    if "rust" in disease_name:
        return [
            "Rust diseases spread by windborne spores and often increase during moist weather.",
            "Nearby alternate host plants or infected leaves can maintain the disease cycle.",
        ]

    if "scab" in disease_name:
        return [
            "Scab is commonly favored by wet leaves and infected fallen debris.",
            "Spores can infect young leaves during rainy or humid periods.",
        ]

    if "black rot" in disease_name:
        return [
            "Black rot can survive in mummified fruit, dead wood, and infected plant debris.",
            "Warm, wet weather and branch wounds can encourage spread.",
        ]

    if "nematode" in disease_name:
        return [
            "Nematodes are soil-borne pests that attack roots and weaken the plant.",
            "Infested soil, infected planting material, and repeated host crops can build pressure.",
        ]

    if "pest" in disease_name or "weevil" in disease_name or "midge" in disease_name:
        return [
            "Pest damage is often caused by insects feeding on leaves, shoots, or fruit.",
            "Unchecked pest populations can spread quickly during favorable weather.",
        ]

    if "virus" in disease_name:
        return [
            "Viral diseases are often spread by insect vectors or infected planting material.",
            "Handling infected plants without cleaning tools can also move virus particles.",
        ]

    return [
        "This disease can be favored by plant stress, humidity, poor airflow, or infected crop debris."
    ]


def get_fallback_prevention(disease):
    disease_name = disease.lower()

    if "healthy" in disease_name:
        return [
            "Keep monitoring leaves weekly for spots, curling, or unusual color changes.",
            "Water at the base and maintain good spacing so leaves dry quickly.",
        ]

    if "leaf mold" in disease_name:
        return [
            "Increase spacing, prune lower leaves, and improve airflow around tomato plants.",
            "Avoid overhead watering and remove infected leaves as soon as symptoms appear.",
        ]

    if "early blight" in disease_name:
        return [
            "Rotate tomatoes or potatoes away from the same bed for at least two seasons.",
            "Mulch soil to reduce splash and remove infected lower leaves promptly.",
        ]

    if "late blight" in disease_name:
        return [
            "Keep foliage dry and inspect plants often during cool, wet weather.",
            "Remove badly infected plants quickly to reduce spread to nearby crops.",
        ]

    if "sooty mould" in disease_name or "sooty mold" in disease_name:
        return [
            "Control sap-sucking insects early by checking leaf undersides regularly.",
            "Reduce ant activity and wash honeydew from leaves when practical.",
        ]

    if "powdery mildew" in disease_name:
        return [
            "Prune crowded growth and avoid excess nitrogen that promotes soft new shoots.",
            "Choose resistant varieties where available and monitor new flushes closely.",
        ]

    if "anthracnose" in disease_name:
        return [
            "Prune for airflow and remove infected fruit, leaves, or twigs from the field.",
            "Avoid working in the crop when foliage is wet.",
        ]

    if "bacterial" in disease_name or "canker" in disease_name:
        return [
            "Disinfect pruning tools and avoid pruning or harvesting when plants are wet.",
            "Use clean planting material and remove badly infected plant parts.",
        ]

    if "rust" in disease_name:
        return [
            "Remove infected leaves early and improve airflow through pruning.",
            "Where practical, reduce nearby alternate host plants that maintain rust spores.",
        ]

    if "scab" in disease_name:
        return [
            "Clear fallen leaves and fruit to reduce spores for the next infection cycle.",
            "Prune the canopy so leaves dry faster after rain.",
        ]

    if "black rot" in disease_name:
        return [
            "Remove mummified fruit, dead branches, and infected debris from the orchard.",
            "Prune carefully and protect wounds during wet disease-favorable periods.",
        ]

    if "nematode" in disease_name:
        return [
            "Rotate with non-host crops and use certified disease-free planting material.",
            "Avoid moving infested soil between fields on tools or footwear.",
        ]

    if "pest" in disease_name or "weevil" in disease_name or "midge" in disease_name:
        return [
            "Scout plants regularly and remove heavily infested leaves, shoots, or fruit.",
            "Use locally approved pest controls only when pest levels justify treatment.",
        ]

    if "virus" in disease_name:
        return [
            "Remove infected plants early and control insect vectors such as aphids or whiteflies.",
            "Use certified disease-free seed or planting material for future crops.",
        ]

    return [
        "Use clean tools, avoid wet leaves, and monitor nearby plants regularly.",
        "Follow local agricultural guidance before applying any chemical treatment.",
    ]
