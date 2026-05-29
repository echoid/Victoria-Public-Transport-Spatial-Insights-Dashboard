from __future__ import annotations

from typing import Any


def clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def distance_points(distance_m: int | None, best_m: int, outer_m: int, weight: float) -> float:
    if distance_m is None or distance_m > outer_m:
        return 0
    if distance_m <= best_m:
        return weight
    share = 1 - ((distance_m - best_m) / (outer_m - best_m))
    return weight * share


def transport_score(nearest: dict[str, Any], counts_800m: dict[str, int]) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []
    score += distance_points(nearest.get("train", {}).get("distance_m"), 400, 1600, 32)
    score += distance_points(nearest.get("tram", {}).get("distance_m"), 400, 1400, 24)
    score += distance_points(nearest.get("bus", {}).get("distance_m"), 250, 800, 20)
    stops_800m = sum(counts_800m.values())
    score += min(14, stops_800m * 0.7)
    modes = sum(1 for count in counts_800m.values() if count > 0)
    score += modes * 3.3

    if nearest.get("train") and nearest["train"]["distance_m"] <= 800:
        reasons.append("Train access is within 800m.")
    if nearest.get("tram") and nearest["tram"]["distance_m"] <= 800:
        reasons.append("Tram access is within 800m.")
    if nearest.get("bus") and nearest["bus"]["distance_m"] <= 400:
        reasons.append("A bus stop is within 400m.")
    if modes >= 2:
        reasons.append("Multiple public transport modes are available nearby.")
    if not reasons:
        reasons.append("Nearby public transport is limited in the current local dataset.")
    return round(clamp(score), 1), reasons


def amenity_score(nearest: dict[str, Any], counts_2km: dict[str, int]) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []
    score += min(25, counts_2km.get("school", 0) * 1.3)
    score += min(20, counts_2km.get("health", 0) * 5)
    score += min(20, counts_2km.get("retail", 0) * 12)
    score += min(20, counts_2km.get("sport", 0) * 0.8)
    score += distance_points(nearest.get("retail", {}).get("distance_m"), 600, 2000, 8)
    score += distance_points(nearest.get("school", {}).get("distance_m"), 800, 2000, 7)

    if counts_2km.get("school", 0):
        reasons.append(f"{counts_2km['school']} school features are within 2km.")
    if counts_2km.get("health", 0):
        reasons.append(f"{counts_2km['health']} health service features are within 2km.")
    if counts_2km.get("retail", 0):
        reasons.append("Retail or supermarket anchors are represented nearby.")
    if counts_2km.get("sport", 0):
        reasons.append(f"{counts_2km['sport']} sport/open-space features are within 2km.")
    if not reasons:
        reasons.append("Amenity coverage is sparse in the current local dataset.")
    return round(clamp(score), 1), reasons


def planning_context_score(overlays: list[dict[str, str]] | None = None) -> tuple[float, list[str]]:
    if overlays:
        return 70.0, ["Planning overlays are present; official planning advice should be checked."]
    return 85.0, ["No planning overlays are loaded for the MVP, so this is context only."]


def overall_score(transport: float, amenity: float, planning: float) -> float:
    return round((transport * 0.45) + (amenity * 0.45) + (planning * 0.10), 1)
