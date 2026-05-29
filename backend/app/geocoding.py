from __future__ import annotations

import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .cache import TTLCache


NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "VictoriaLocationIntelligenceMVP/0.1 (open-data portfolio project)"

cache: TTLCache[list[dict[str, str | float]]] = TTLCache(ttl_seconds=7 * 86_400)


def geocode(query: str) -> list[dict[str, str | float]]:
    normalized = " ".join(query.strip().split())
    if not normalized:
        return []

    cache_key = normalized.lower()
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    params = {
        "q": f"{normalized}, Victoria, Australia",
        "format": "jsonv2",
        "addressdetails": 1,
        "limit": 5,
        "countrycodes": "au",
        "viewbox": "140.9,-33.8,150.2,-39.3",
        "bounded": 1,
    }
    request = Request(
        f"{NOMINATIM_URL}?{urlencode(params)}",
        headers={"User-Agent": USER_AGENT, "Referer": "http://localhost:5173"},
    )
    with urlopen(request, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))

    results = [
        {
            "display_name": item.get("display_name", ""),
            "lat": float(item["lat"]),
            "lon": float(item["lon"]),
            "type": item.get("type") or item.get("class") or "place",
        }
        for item in payload
    ]
    cache.set(cache_key, results)
    return results
