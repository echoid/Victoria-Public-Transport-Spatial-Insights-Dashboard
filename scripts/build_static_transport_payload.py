from __future__ import annotations

import json
import math
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


def perpendicular_distance(point: list[float], start: list[float], end: list[float]) -> float:
    x, y = point
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    return abs(dy * x - dx * y + x2 * y1 - y2 * x1) / math.hypot(dx, dy)


def rdp(points: list[list[float]], epsilon: float) -> list[list[float]]:
    if len(points) <= 2:
        return points

    max_distance = 0.0
    index = 0
    for i in range(1, len(points) - 1):
        distance = perpendicular_distance(points[i], points[0], points[-1])
        if distance > max_distance:
            index = i
            max_distance = distance

    if max_distance > epsilon:
        left = rdp(points[: index + 1], epsilon)
        right = rdp(points[index:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


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
                    "coordinates": simplified,
                    "bbox": [min(lons), min(lats), max(lons), max(lats)],
                }
            )
    return lines


def main() -> None:
    payload = load_seed_payload()
    stop_features = build_stop_features()
    route_lines = build_route_lines()

    payload["features"] = stop_features + payload.get("features", [])
    payload["route_lines"] = route_lines
    payload["metadata"] = {
        **payload.get("metadata", {}),
        "transport_features_source": "Transport Victoria / Data Vic Public Transport Lines and Stops GeoJSON.",
        "transport_stop_count": len(stop_features),
        "transport_line_count": len(route_lines),
        "source_counts": {
            **payload.get("metadata", {}).get("source_counts", {}),
            "transport_stops_all": len(stop_features),
            "transport_lines_simplified": len(route_lines),
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


if __name__ == "__main__":
    main()
