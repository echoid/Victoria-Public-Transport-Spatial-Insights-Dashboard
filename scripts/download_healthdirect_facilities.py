from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "raw" / "national_healthdirect_facilities_vic.json"
BASE_URL = "https://services.ga.gov.au/gis/rest/services/National_HealthDirect_Health_Facilities/MapServer"
FIELDS = ",".join(
    [
        "objectid",
        "operationalstatus",
        "organisation_name",
        "address",
        "suburb",
        "state",
        "postcode",
        "longitude",
        "latitude",
        "nhsd_service_id",
        "nhsd_service_type",
        "ga_source_date",
    ]
)

LAYERS = [
    {"id": 0, "kind": "general_practice", "label": "General practice"},
    {"id": 1, "kind": "hospital", "label": "Hospital"},
    {"id": 2, "kind": "pharmacy", "label": "Pharmacy"},
]


def fetch_page(layer_id: int, offset: int, page_size: int) -> dict:
    params = {
        "f": "json",
        "where": "state='VIC'",
        "outFields": FIELDS,
        "returnGeometry": "false",
        "resultOffset": str(offset),
        "resultRecordCount": str(page_size),
        "orderByFields": "objectid ASC",
    }
    url = f"{BASE_URL}/{layer_id}/query?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": "vic-location-intelligence-dashboard/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def fetch_layer(layer: dict, page_size: int) -> list[dict]:
    offset = 0
    features = []
    while True:
        page = fetch_page(layer["id"], offset, page_size)
        page_features = page.get("features", [])
        for feature in page_features:
            feature["health_kind"] = layer["kind"]
            feature["health_label"] = layer["label"]
            feature["source_layer"] = layer["id"]
        features.extend(page_features)
        print(f"{layer['label']}: fetched {len(page_features):,} records at offset {offset:,}")
        if len(page_features) < page_size:
            break
        offset += page_size
    return features


def main() -> None:
    page_size = 1000
    features = []
    for layer in LAYERS:
        features.extend(fetch_layer(layer, page_size))

    payload = {
        "source": "National HealthDirect Health Facilities MapServer",
        "url": BASE_URL,
        "layers": LAYERS,
        "features": features,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))
    print(f"Wrote {len(features):,} records to {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
