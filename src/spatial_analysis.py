from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def build_lga_geojson(lga: pd.DataFrame) -> dict:
    features = []
    for row in lga.itertuples(index=False):
        polygon = json.loads(row.geometry_geojson)
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "lga_name": row.lga_name,
                    "stop_count": int(row.stop_count),
                    "stop_density_per_sq_km": round(float(row.stop_density_per_sq_km), 3),
                    "mode_diversity": int(row.mode_diversity),
                    "region_type": row.region_type,
                },
                "geometry": polygon,
            }
        )
    return {"type": "FeatureCollection", "features": features}


def calculate_access_indicators(stops: pd.DataFrame, lga: pd.DataFrame) -> pd.DataFrame:
    """Calculate simple LGA access indicators from prepared stop and LGA tables."""
    grouped = (
        stops.groupby("lga_name")
        .agg(stop_count=("stop_id", "count"), mode_diversity=("mode", "nunique"))
        .reset_index()
    )
    output = lga.merge(grouped, on="lga_name", how="left")
    output[["stop_count", "mode_diversity"]] = output[["stop_count", "mode_diversity"]].fillna(0)
    output["stop_density_per_sq_km"] = output["stop_count"] / output["area_sq_km"]
    return output


def calculate_geospatial_access_indicators(stops_path: Path, lga_path: Path, output_path: Path) -> None:
    import geopandas as gpd

    stops = gpd.read_file(stops_path).to_crs("EPSG:4326")
    lga = gpd.read_file(lga_path).to_crs("EPSG:4326")
    stops = stops.rename(columns={column: column.lower() for column in stops.columns})
    lga = lga.rename(columns={column: column.lower() for column in lga.columns})

    if "mode" not in stops.columns:
        raise ValueError("Stops layer must include a mode column.")
    if "lga_name" not in lga.columns:
        raise ValueError("LGA layer must include an lga_name column.")

    joined = gpd.sjoin(stops, lga[["lga_name", "geometry"]], how="left", predicate="within")
    counts = (
        joined.groupby("lga_name")
        .agg(stop_count=("geometry", "count"), mode_diversity=("mode", "nunique"))
        .reset_index()
    )

    metric_lga = lga.to_crs("EPSG:7855")
    lga["area_sq_km"] = metric_lga.area / 1_000_000
    summary = lga.merge(counts, on="lga_name", how="left")
    summary[["stop_count", "mode_diversity"]] = summary[["stop_count", "mode_diversity"]].fillna(0)
    summary["stop_density_per_sq_km"] = summary["stop_count"] / summary["area_sq_km"]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary.to_file(output_path, driver="GeoJSON")


def save_access_summary(stops_path: Path, lga_path: Path, output_path: Path) -> None:
    stops = pd.read_csv(stops_path)
    lga = pd.read_csv(lga_path)
    summary = calculate_access_indicators(stops, lga)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary.to_csv(output_path, index=False)
