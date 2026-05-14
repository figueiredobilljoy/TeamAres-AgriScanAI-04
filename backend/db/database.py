import sqlite3
from pathlib import Path

try:
    from services.location_service import SEARCH_RADIUS_METERS, calculate_distance_km
except ModuleNotFoundError:
    from backend.services.location_service import SEARCH_RADIUS_METERS, calculate_distance_km


DB_DIR = Path(__file__).resolve().parent
DB_PATH = DB_DIR / "reports.db"
SCHEMA_PATH = DB_DIR / "schema.sql"


def get_connection():
    DB_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.executescript(SCHEMA_PATH.read_text())


def save_disease_report(crop, disease, confidence, latitude=None, longitude=None):
    if parse_confidence_percent(confidence) < 60:
        return False

    lat = parse_coordinate(latitude)
    lon = parse_coordinate(longitude)

    if lat is not None:
        lat = round(lat, 3)
    if lon is not None:
        lon = round(lon, 3)

    with get_connection() as connection:
        if lat is not None and lon is not None:
            duplicate = connection.execute(
                """
                SELECT 1 FROM disease_reports
                WHERE crop = ? AND disease = ? 
                  AND latitude = ? AND longitude = ?
                  AND created_at >= datetime('now', '-1 hour')
                LIMIT 1
                """,
                (crop, disease, lat, lon),
            ).fetchone()
        else:
            duplicate = connection.execute(
                """
                SELECT 1 FROM disease_reports
                WHERE crop = ? AND disease = ? AND confidence = ?
                  AND created_at >= datetime('now', '-60 seconds')
                LIMIT 1
                """,
                (crop, disease, confidence),
            ).fetchone()

        if duplicate:
            return True

        connection.execute(
            """
            INSERT INTO disease_reports (crop, disease, confidence, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)
            """,
            (crop, disease, confidence, lat, lon),
        )

    return True


def get_nearby_disease_insights(latitude, longitude, limit=5):
    lat = parse_coordinate(latitude)
    lon = parse_coordinate(longitude)

    if lat is None or lon is None:
        return []

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT crop, disease, confidence, latitude, longitude, created_at
            FROM disease_reports
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 200
            """
        ).fetchall()

    nearby_reports = []

    for row in rows:
        distance_km = calculate_distance_km(lat, lon, row["latitude"], row["longitude"])

        if distance_km <= SEARCH_RADIUS_METERS / 1000:
            nearby_reports.append({**dict(row), "distance_km": distance_km})

    grouped_reports = {}

    for report in nearby_reports:
        key = (report["crop"], report["disease"])
        grouped_reports.setdefault(key, []).append(report)

    insights = []

    for (crop, disease), reports in grouped_reports.items():
        average_distance = sum(report["distance_km"] for report in reports) / len(reports)
        insights.append(
            {
                "crop": crop,
                "disease": disease,
                "count": len(reports),
                "average_distance_km": round(average_distance, 2),
                "message": build_insight_message(disease, len(reports)),
            }
        )

    insights.sort(key=lambda item: (-item["count"], item["average_distance_km"]))
    return insights[:limit]


def build_insight_message(disease, count):
    if count >= 3:
        return f"{disease} frequently reported nearby"

    if count == 2:
        return f"{disease} has multiple recent nearby reports"

    return f"{disease} reported near your area"


def parse_coordinate(value):
    if value in (None, ""):
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def parse_confidence_percent(confidence):
    if confidence in (None, ""):
        return 0

    if isinstance(confidence, (int, float)):
        return float(confidence)

    try:
        return float(str(confidence).replace("%", "").strip())
    except ValueError:
        return 0
