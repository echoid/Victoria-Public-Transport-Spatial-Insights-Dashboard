from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "processed" / "home_location_dashboard_data.json"
EARTH_RADIUS_KM = 6371.0088


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@lru_cache(maxsize=1)
def load_payload() -> dict[str, Any]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_features() -> tuple[dict[str, Any], ...]:
    features = []
    for index, feature in enumerate(load_payload()["features"]):
        if feature.get("lat") is None or feature.get("lon") is None:
            continue
        features.append(
            {
                "id": f"{feature.get('category', 'feature')}-{index}",
                "name": feature.get("name") or "Unnamed feature",
                "category": feature.get("category") or "unknown",
                "lat": float(feature["lat"]),
                "lon": float(feature["lon"]),
                "routes": feature.get("routes"),
                "source": feature.get("source"),
            }
        )
    return tuple(features)


def nearest_property_context(lat: float, lon: float) -> dict[str, Any] | None:
    properties = load_payload().get("properties", [])
    if not properties:
        return None
    nearest = min(properties, key=lambda item: haversine_km(lat, lon, float(item["lat"]), float(item["lon"])))
    distance_km = haversine_km(lat, lon, float(nearest["lat"]), float(nearest["lon"]))
    return {
        "suburb": nearest.get("suburb"),
        "lga": nearest.get("lga"),
        "reference_location": nearest.get("address"),
        "reference_distance_km": round(distance_km, 2),
    }


def features_within(lat: float, lon: float, radius_m: int) -> list[dict[str, Any]]:
    radius_km = radius_m / 1000
    rows = []
    for feature in load_features():
        distance_km = haversine_km(lat, lon, feature["lat"], feature["lon"])
        if distance_km <= radius_km:
            rows.append({**feature, "distance_m": round(distance_km * 1000)})
    return sorted(rows, key=lambda item: item["distance_m"])


def nearest_by_category(lat: float, lon: float, categories: set[str]) -> dict[str, Any] | None:
    candidates = [item for item in load_features() if item["category"] in categories]
    if not candidates:
        return None
    nearest = min(candidates, key=lambda item: haversine_km(lat, lon, item["lat"], item["lon"]))
    distance_km = haversine_km(lat, lon, nearest["lat"], nearest["lon"])
    return {**nearest, "distance_m": round(distance_km * 1000)}


def counts_for_categories(features: list[dict[str, Any]], categories: set[str], radii_m: tuple[int, ...]) -> dict[str, dict[str, int]]:
    result: dict[str, dict[str, int]] = {}
    for radius in radii_m:
        within = [item for item in features if item["distance_m"] <= radius and item["category"] in categories]
        result[f"within_{radius}m"] = {}
        for category in sorted(categories):
            result[f"within_{radius}m"][category] = sum(1 for item in within if item["category"] == category)
    return result
