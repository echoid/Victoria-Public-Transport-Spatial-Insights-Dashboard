from __future__ import annotations

import argparse
from pathlib import Path

import requests


RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

DATA_SOURCES = {
    "stops": {
        "url": "https://opendata.transport.vic.gov.au/dataset/6d36dfd9-8693-4552-8a03-05eb29a391fd/resource/a2cba0b0-bddc-4b87-b495-2b6b7013af6e/download/public_transport_stops.geojson",
        "filename": "public_transport_stops.geojson",
        "landing_page": "https://discover.data.vic.gov.au/dataset/public-transport-lines-and-stops/resource/a2cba0b0-bddc-4b87-b495-2b6b7013af6e",
    },
    "lines": {
        "url": "https://opendata.transport.vic.gov.au/dataset/6d36dfd9-8693-4552-8a03-05eb29a391fd/resource/a9836237-2647-462b-ad76-bd24d71d8598/download/public_transport_lines.geojson",
        "filename": "public_transport_lines.geojson",
        "landing_page": "https://opendata.transport.vic.gov.au/dataset/public-transport-lines-and-stops/resource/a9836237-2647-462b-ad76-bd24d71d8598",
    },
    "patronage": {
        "url": "https://opendata.transport.vic.gov.au/dataset/1ab35aa9-f21d-4f00-939b-60dade427d45/resource/74174b02-76bc-4d10-ae7c-401d90ef033c/download/monthly_public_transport_patronage_by_mode.csv",
        "filename": "monthly_public_transport_patronage_by_mode.csv",
        "landing_page": "https://discover.data.vic.gov.au/dataset/monthly-public-transport-patronage-by-mode",
    },
    "gtfs": {
        "url": "https://opendata.transport.vic.gov.au/dataset/3f4e292e-7f8a-4ffe-831f-1953be0fe448/resource/fb152201-859f-4882-9206-b768060b50ad/download/gtfs.zip",
        "filename": "gtfs.zip",
        "landing_page": "https://discover.data.vic.gov.au/dataset/gtfs-schedule",
    },
}


def download_file(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, timeout=90, stream=True) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)


def main() -> None:
    parser = argparse.ArgumentParser(description="Download open data inputs for the dashboard.")
    parser.add_argument(
        "--source",
        choices=sorted(DATA_SOURCES),
        default="patronage",
        help="Dataset key to download. LGA boundaries are listed in the README because DataShare format selection is interactive.",
    )
    args = parser.parse_args()

    source = DATA_SOURCES[args.source]
    output = RAW_DIR / source["filename"]
    download_file(source["url"], output)
    print(f"Saved {args.source} to {output}")
    print(f"Landing page: {source['landing_page']}")


if __name__ == "__main__":
    main()
