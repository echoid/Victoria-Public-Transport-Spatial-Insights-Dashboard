from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_PATH = ROOT / "data" / "processed" / "home_location_dashboard_data.json"
FRONTEND_PATH = ROOT / "frontend" / "public" / "data" / "home_location_dashboard_data.json"
DOCS_PATH = ROOT / "docs" / "data" / "home_location_dashboard_data.json"

STOP_MODE_TO_CATEGORY = {
    "METRO TRAIN": "train",
    "REGIONAL TRAIN": "train",
    "INTERSTATE TRAIN": "train",
    "METRO TRAM": "tram",
    "METRO BUS": "bus",
    "REGIONAL BUS": "bus",
    "REGIONAL COACH": "bus",
    "SKYBUS": "bus",
}

LINE_MODE_TO_CATEGORY = STOP_MODE_TO_CATEGORY

MODE_TO_KIND = {
    "METRO TRAIN": "metro_train",
    "REGIONAL TRAIN": "regional_train",
    "INTERSTATE TRAIN": "other_train",
    "METRO TRAM": "metro_tram",
    "METRO BUS": "myki_bus",
    "REGIONAL BUS": "regional_bus",
    "REGIONAL COACH": "regional_coach",
    "SKYBUS": "skybus",
}

MODE_LABELS = {
    "metro_train": "Metropolitan Train",
    "regional_train": "Regional Train",
    "other_train": "Other Train",
    "metro_tram": "Metropolitan Tram",
    "myki_bus": "Myki Bus",
    "regional_bus": "Regional Bus",
    "regional_coach": "Regional Coach",
    "skybus": "SkyBus",
    "other_bus": "Other Bus",
}


def mode_kind(mode: str | None, category: str) -> str:
    if mode in MODE_TO_KIND:
        return MODE_TO_KIND[mode]
    return f"other_{category}"


def cap_points(points: list[list[float]], max_points: int) -> list[list[float]]:
    if len(points) <= max_points:
        return points
    step = (len(points) - 1) / (max_points - 1)
    capped = [points[round(i * step)] for i in range(max_points - 1)]
    capped.append(points[-1])
    return capped


def round_coord(coord: list[float]) -> list[float]:
    return [round(float(coord[0]), 5), round(float(coord[1]), 5)]


def simplify_line(coords: list[list[float]]) -> list[list[float]]:
    rounded = [round_coord(coord) for coord in coords if len(coord) >= 2]
    if len(rounded) <= 2:
        return rounded
    return cap_points(rounded, 80)


def line_parts(geometry: dict) -> list[list[list[float]]]:
    if geometry.get("type") == "LineString":
        return [geometry.get("coordinates", [])]
    if geometry.get("type") == "MultiLineString":
        return geometry.get("coordinates", [])
    return []


def clean_label(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def load_seed_payload() -> dict:
    with PROCESSED_PATH.open() as handle:
        payload = json.load(handle)
    payload["features"] = [
        feature for feature in payload.get("features", []) if feature.get("category") not in {"train", "tram", "bus"}
    ]
    return payload


def build_stop_features() -> list[dict]:
    with (RAW_DIR / "public_transport_stops.geojson").open() as handle:
        raw = json.load(handle)

    features = []
    seen = set()
    for item in raw.get("features", []):
        props = item.get("properties", {})
        geometry = item.get("geometry") or {}
        coords = geometry.get("coordinates") or []
        mode = clean_label(props.get("MODE"))
        category = STOP_MODE_TO_CATEGORY.get(mode or "")
        stop_id = clean_label(props.get("STOP_ID"))
        if not category or len(coords) < 2:
            continue
        key = (stop_id, round(float(coords[1]), 6), round(float(coords[0]), 6), category)
        if key in seen:
            continue
        seen.add(key)
        features.append(
            {
                "id": f"stop-{stop_id or len(features)}",
                "stop_id": stop_id,
                "name": clean_label(props.get("STOP_NAME")) or "Public transport stop",
                "category": category,
                "mode": mode,
                "transport_kind": mode_kind(mode, category),
                "mode_label": MODE_LABELS.get(mode_kind(mode, category), mode or category.title()),
                "lat": round(float(coords[1]), 6),
                "lon": round(float(coords[0]), 6),
            }
        )
    return features


def build_route_lines() -> list[dict]:
    with (RAW_DIR / "public_transport_lines.geojson").open() as handle:
        raw = json.load(handle)

    lines = []
    seen = set()
    for item in raw.get("features", []):
        props = item.get("properties", {})
        mode = clean_label(props.get("MODE"))
        category = LINE_MODE_TO_CATEGORY.get(mode or "")
        if not category:
            continue

        route = clean_label(props.get("SHORT_NAME")) or clean_label(props.get("LONG_NAME")) or mode
        long_name = clean_label(props.get("LONG_NAME"))
        headsign = clean_label(props.get("HEADSIGN"))
        shape_id = clean_label(props.get("SHAPE_ID"))
        for part_index, coords in enumerate(line_parts(item.get("geometry") or {})):
            simplified = simplify_line(coords)
            if len(simplified) < 2:
                continue
            geometry_key = tuple((point[0], point[1]) for point in simplified)
            key = (category, route, long_name, headsign, geometry_key)
            if key in seen:
                continue
            seen.add(key)
            lons = [point[0] for point in simplified]
            lats = [point[1] for point in simplified]
            lines.append(
                {
                    "id": f"line-{shape_id or len(lines)}-{part_index}",
                    "name": long_name or route or "Public transport line",
                    "route": route,
                    "headsign": headsign,
                    "category": category,
                    "mode": mode,
                    "transport_kind": mode_kind(mode, category),
                    "mode_label": MODE_LABELS.get(mode_kind(mode, category), mode or category.title()),
                    "coordinates": simplified,
                    "bbox": [min(lons), min(lats), max(lons), max(lats)],
                }
            )
    return lines


def route_option_id(category: str, route: str, index: int) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", route.lower()).strip("-")[:48]
    return f"route-{category}-{slug or index}"


def build_route_options(route_lines: list[dict]) -> list[dict]:
    grouped_lines: dict[tuple[str, str], list[dict]] = {}
    for line in route_lines:
        grouped_lines.setdefault((line["category"], line["name"] or line.get("route") or "Route"), []).append(line)

    options = []
    for option_index, ((category, label), lines) in enumerate(sorted(grouped_lines.items())):
        min_lon = min(line["bbox"][0] for line in lines)
        min_lat = min(line["bbox"][1] for line in lines)
        max_lon = max(line["bbox"][2] for line in lines)
        max_lat = max(line["bbox"][3] for line in lines)
        route_names = sorted({line.get("route") for line in lines if line.get("route")})
        route = ", ".join(route_names[:3])
        if len(route_names) > 3:
            route = f"{route} +{len(route_names) - 3}"

        options.append(
            {
                "id": route_option_id(category, label, option_index),
                "category": category,
                "transport_kind": lines[0].get("transport_kind"),
                "mode_label": lines[0].get("mode_label"),
                "route": route,
                "label": label,
                "line_ids": [line["id"] for line in lines],
                "bbox": [min_lon, min_lat, max_lon, max_lat],
                "line_count": len(lines),
            }
        )
    return options


def main() -> None:
    payload = load_seed_payload()
    stop_features = build_stop_features()
    route_lines = build_route_lines()
    route_options = build_route_options(route_lines)

    payload["features"] = stop_features + payload.get("features", [])
    payload["route_lines"] = route_lines
    payload["route_options"] = route_options
    payload["metadata"] = {
        **payload.get("metadata", {}),
        "transport_features_source": "Transport Victoria / Data Vic Public Transport Lines and Stops GeoJSON.",
        "transport_stop_count": len(stop_features),
        "transport_line_count": len(route_lines),
        "transport_route_count": len(route_options),
        "source_counts": {
            **payload.get("metadata", {}).get("source_counts", {}),
            "transport_stops_all": len(stop_features),
            "transport_lines_simplified": len(route_lines),
            "transport_route_options": len(route_options),
            "web_payload_features": len(payload["features"]),
        },
    }

    for output_path in [PROCESSED_PATH, FRONTEND_PATH, DOCS_PATH]:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w") as handle:
            json.dump(payload, handle, separators=(",", ":"))
        print(f"Wrote {output_path.relative_to(ROOT)}")

    print(f"Stops: {len(stop_features):,}")
    print(f"Route lines: {len(route_lines):,}")
    print(f"Route options: {len(route_options):,}")


if __name__ == "__main__":
    main()
