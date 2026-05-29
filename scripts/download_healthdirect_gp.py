from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "raw" / "national_healthdirect_general_practice_vic.json"
QUERY_URL = "https://services.ga.gov.au/gis/rest/services/National_HealthDirect_Health_Facilities/MapServer/0/query"
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
        "nhsd_service_type",
        "ga_source_date",
    ]
)


def fetch_page(offset: int, page_size: int) -> dict:
    params = {
        "f": "json",
        "where": "state='VIC'",
        "outFields": FIELDS,
        "returnGeometry": "false",
        "resultOffset": str(offset),
        "resultRecordCount": str(page_size),
        "orderByFields": "objectid ASC",
    }
    url = f"{QUERY_URL}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": "vic-location-intelligence-dashboard/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def main() -> None:
    page_size = 1000
    offset = 0
    features = []
    while True:
        page = fetch_page(offset, page_size)
        page_features = page.get("features", [])
        features.extend(page_features)
        print(f"Fetched {len(page_features):,} records at offset {offset:,}")
        if len(page_features) < page_size:
            break
        offset += page_size

    payload = {
        "source": "National HealthDirect Health Facilities MapServer / GENERAL_PRACTICE",
        "url": "https://services.ga.gov.au/gis/rest/services/National_HealthDirect_Health_Facilities/MapServer/0",
        "features": features,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))
    print(f"Wrote {len(features):,} records to {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
