import json
import logging
import math
import urllib.parse
import urllib.request


LOGGER = logging.getLogger(__name__)
OVERPASS_URLS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
)
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
SEARCH_RADIUS_METERS = 5000
MAX_STORES = 8
SEARCH_TERMS = (
    "agriculture store",
    "fertilizer shop",
    "pesticide store",
    "seed store",
    "pharmacy",
)


def find_nearby_agriculture_stores(latitude, longitude):
    if latitude is None or longitude is None:
        return [], ""

    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError):
        return [], "Location coordinates were invalid."

    if not is_valid_coordinate(lat, lon):
        return [], "Location coordinates were outside the valid range."

    try:
        stores = fetch_nominatim_stores(lat, lon)
        return stores, "" if stores else "No nearby agriculture-related stores were found."
    except Exception as error:
        LOGGER.warning("Nearby store lookup failed: %s", error)
        return [], "Nearby store lookup is temporarily unavailable."


def is_valid_coordinate(latitude, longitude):
    return -90 <= latitude <= 90 and -180 <= longitude <= 180


def fetch_nominatim_stores(latitude, longitude):
    stores = []
    seen = set()

    for search_term in SEARCH_TERMS:
        try:
            search_results = fetch_nominatim_results(search_term, latitude, longitude)
        except Exception as error:
            LOGGER.warning("Nominatim search failed for %s: %s", search_term, error)
            continue

        for item in search_results:
            name = item.get("name") or item.get("display_name", "").split(",", 1)[0]
            address = item.get("display_name") or "Address not available"
            store_lat = float(item["lat"])
            store_lon = float(item["lon"])
            distance_km = calculate_distance_km(latitude, longitude, store_lat, store_lon)

            if distance_km > SEARCH_RADIUS_METERS / 1000:
                continue

            dedupe_key = (name.lower(), round(store_lat, 4), round(store_lon, 4))

            if dedupe_key in seen:
                continue

            seen.add(dedupe_key)
            stores.append(
                {
                    "name": name,
                    "address": address,
                    "distance_km": round(distance_km, 2),
                }
            )

    stores.sort(key=lambda store: store["distance_km"])
    return stores[:MAX_STORES]


def fetch_nominatim_results(search_term, latitude, longitude):
    left, top, right, bottom = build_bounding_box(latitude, longitude)
    params = urllib.parse.urlencode(
        {
            "q": search_term,
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": 5,
            "bounded": 1,
            "viewbox": f"{left},{top},{right},{bottom}",
        }
    )
    request = urllib.request.Request(
        f"{NOMINATIM_URL}?{params}",
        headers={"User-Agent": "AgriScanAI/1.0 hackathon crop advisory app"},
        method="GET",
    )

    with urllib.request.urlopen(request, timeout=6) as response:
        return json.loads(response.read().decode("utf-8"))


def build_bounding_box(latitude, longitude):
    radius_km = SEARCH_RADIUS_METERS / 1000
    lat_delta = radius_km / 111
    lon_delta = radius_km / (111 * max(math.cos(math.radians(latitude)), 0.1))

    left = longitude - lon_delta
    right = longitude + lon_delta
    top = latitude + lat_delta
    bottom = latitude - lat_delta

    return left, top, right, bottom


def fetch_overpass_results(latitude, longitude):
    query = build_overpass_query(latitude, longitude)
    encoded_body = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last_error = None

    for overpass_url in OVERPASS_URLS:
        request = urllib.request.Request(
            overpass_url,
            data=encoded_body,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "AgriScanAI/1.0 hackathon crop advisory app",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=18) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:
            last_error = error
            LOGGER.warning("Overpass endpoint failed (%s): %s", overpass_url, error)

    raise RuntimeError(last_error)


def build_overpass_query(latitude, longitude):
    radius = SEARCH_RADIUS_METERS

    return f"""
[out:json][timeout:10];
(
  nwr(around:{radius},{latitude},{longitude})["shop"~"^(agrarian|garden_centre|farm|chemist)$"];
  nwr(around:{radius},{latitude},{longitude})["amenity"="pharmacy"];
  nwr(around:{radius},{latitude},{longitude})["name"~"(agri|agro|agriculture|fertilizer|fertiliser|pesticide|seeds|krishi)",i];
);
out center tags 40;
"""


def build_store_results(elements, latitude, longitude):
    stores = []
    seen = set()

    for element in elements:
        tags = element.get("tags", {})
        name = tags.get("name") or get_store_type(tags)

        if not name:
            continue

        store_lat, store_lon = get_element_coordinates(element)

        if store_lat is None or store_lon is None:
            continue

        dedupe_key = (name.lower(), round(store_lat, 4), round(store_lon, 4))

        if dedupe_key in seen:
            continue

        seen.add(dedupe_key)
        distance_km = calculate_distance_km(latitude, longitude, store_lat, store_lon)
        stores.append(
            {
                "name": name,
                "address": format_address(tags),
                "distance_km": round(distance_km, 2),
            }
        )

    stores.sort(key=lambda store: store["distance_km"])
    return stores[:MAX_STORES]


def get_element_coordinates(element):
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])

    center = element.get("center")

    if center and "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])

    return None, None


def get_store_type(tags):
    if tags.get("amenity") == "pharmacy":
        return "Pharmacy"

    shop_type = tags.get("shop", "").replace("_", " ").title()
    return shop_type or "Agriculture Store"


def format_address(tags):
    address_parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:suburb"),
        tags.get("addr:city") or tags.get("addr:town") or tags.get("addr:village"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
    ]
    address = ", ".join(part for part in address_parts if part)

    if address:
        return address

    return tags.get("addr:full") or tags.get("description") or "Address not available"


def calculate_distance_km(start_latitude, start_longitude, end_latitude, end_longitude):
    earth_radius_km = 6371
    lat_delta = math.radians(end_latitude - start_latitude)
    lon_delta = math.radians(end_longitude - start_longitude)
    start_lat = math.radians(start_latitude)
    end_lat = math.radians(end_latitude)

    haversine_value = (
        math.sin(lat_delta / 2) ** 2
        + math.cos(start_lat) * math.cos(end_lat) * math.sin(lon_delta / 2) ** 2
    )
    central_angle = 2 * math.atan2(math.sqrt(haversine_value), math.sqrt(1 - haversine_value))
    return earth_radius_km * central_angle
