from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .geocoding import geocode
from .scoring import amenity_score, overall_score, planning_context_score, transport_score
from .spatial import counts_for_categories, features_within, nearest_by_category, nearest_property_context


app = FastAPI(title="Victoria Location Intelligence API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRANSPORT = {"train", "tram", "bus"}
AMENITY_GROUPS = {
    "schools": {"school"},
    "health": {"health"},
    "retail": {"retail"},
    "parks_sport": {"sport"},
}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/geocode")
def geocode_endpoint(query: str = Query(..., min_length=2, max_length=160)) -> dict[str, list[dict[str, str | float]]]:
    try:
        return {"results": geocode(query)}
    except Exception as exc:  # pragma: no cover - protects public API from upstream failures
        raise HTTPException(status_code=502, detail=f"Geocoding service unavailable: {exc}") from exc


@app.get("/api/location-report")
def location_report(
    lat: float = Query(..., ge=-39.5, le=-33.0),
    lon: float = Query(..., ge=140.0, le=150.5),
    radius: int = Query(2000, ge=400, le=5000),
) -> dict:
    all_nearby = features_within(lat, lon, max(radius, 2000))
    transport_features = [item for item in all_nearby if item["category"] in TRANSPORT and item["distance_m"] <= radius]
    amenity_features = [item for item in all_nearby if item["category"] not in TRANSPORT and item["distance_m"] <= radius]

    nearest_transport = {
        "train": nearest_by_category(lat, lon, {"train"}),
        "tram": nearest_by_category(lat, lon, {"tram"}),
        "bus": nearest_by_category(lat, lon, {"bus"}),
    }
    nearest_amenities = {
        name: nearest_by_category(lat, lon, categories) for name, categories in AMENITY_GROUPS.items()
    }

    transport_counts = counts_for_categories(all_nearby, TRANSPORT, (400, 800, 2000))
    amenity_counts = {
        name: {
            radius_name: sum(values.get(category, 0) for category in categories)
            for radius_name, values in counts_for_categories(all_nearby, categories, (400, 800, 2000)).items()
        }
        for name, categories in AMENITY_GROUPS.items()
    }

    transport_value, transport_reasons = transport_score(nearest_transport, transport_counts["within_800m"])
    amenity_counts_2km = {
        category: counts_for_categories(all_nearby, {category}, (2000,))["within_2000m"][category]
        for category in {"school", "health", "retail", "sport"}
    }
    nearest_by_raw_category = {
        category: nearest_by_category(lat, lon, {category}) for category in {"school", "health", "retail", "sport"}
    }
    amenity_value, amenity_reasons = amenity_score(nearest_by_raw_category, amenity_counts_2km)
    planning_value, planning_reasons = planning_context_score([])
    overall = overall_score(transport_value, amenity_value, planning_value)

    context = nearest_property_context(lat, lon) or {}
    location_label = context.get("reference_location")
    if context.get("reference_distance_km", 99) > 2:
        location_label = f"Selected map point near {context.get('suburb', 'Victoria')}"

    return {
        "location": {
            "lat": lat,
            "lon": lon,
            "address": location_label,
            "suburb": context.get("suburb"),
            "lga": context.get("lga"),
            "reference_distance_km": context.get("reference_distance_km"),
        },
        "transport": {
            "nearest_train": nearest_transport["train"],
            "nearest_tram": nearest_transport["tram"],
            "nearest_bus": nearest_transport["bus"],
            "counts": transport_counts,
        },
        "amenities": {
            "counts": amenity_counts,
            "nearest": nearest_amenities,
        },
        "planning": {
            "zone": "Not loaded in MVP",
            "overlays": [],
            "note": "Planning zones and overlays are listed as a V2 data import. Check official Victorian Government tools before making decisions.",
        },
        "scores": {
            "transport_score": transport_value,
            "amenity_score": amenity_value,
            "planning_context_score": planning_value,
            "overall_score": overall,
            "reasons": {
                "transport": transport_reasons,
                "amenities": amenity_reasons,
                "planning": planning_reasons,
            },
            "weights": {"transport": 0.45, "amenities": 0.45, "planning": 0.10},
        },
        "map_features": {
            "transport": transport_features[:300],
            "schools": [item for item in amenity_features if item["category"] == "school"][:150],
            "health": [item for item in amenity_features if item["category"] == "health"][:80],
            "retail": [item for item in amenity_features if item["category"] == "retail"][:80],
            "parks_sport": [item for item in amenity_features if item["category"] == "sport"][:150],
        },
    }
