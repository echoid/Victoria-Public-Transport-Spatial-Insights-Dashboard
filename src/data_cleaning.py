from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.utils import clean_column_names


PATRONAGE_MODES = [
    "Metropolitan train",
    "Tram",
    "Metropolitan bus",
    "Regional train",
    "Regional coach",
    "Regional bus",
]


def clean_patronage(raw_csv: Path, output_csv: Path) -> pd.DataFrame:
    df = pd.read_csv(raw_csv)
    df = df.rename(columns={"Month name": "month_name"})
    df["date"] = pd.to_datetime(dict(year=df["Year"], month=df["Month"], day=1))
    long_df = df.melt(
        id_vars=["date", "Year", "Month"],
        value_vars=[mode for mode in PATRONAGE_MODES if mode in df.columns],
        var_name="mode",
        value_name="patronage",
    )
    long_df["patronage"] = pd.to_numeric(long_df["patronage"], errors="coerce")
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    long_df.to_csv(output_csv, index=False)
    return long_df


def clean_stops_geojson(raw_geojson: Path, output_csv: Path) -> pd.DataFrame:
    import geopandas as gpd

    gdf = clean_column_names(gpd.read_file(raw_geojson))
    required = {"stop_id", "stop_name", "mode", "geometry"}
    missing = required.difference(gdf.columns)
    if missing:
        raise ValueError(f"Stops file is missing expected columns: {sorted(missing)}")

    gdf = gdf.to_crs("EPSG:4326")
    stops = pd.DataFrame(
        {
            "stop_id": gdf["stop_id"],
            "stop_name": gdf["stop_name"],
            "mode": gdf["mode"].str.title(),
            "lat": gdf.geometry.y,
            "lon": gdf.geometry.x,
        }
    )
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    stops.to_csv(output_csv, index=False)
    return stops


def clean_lga_boundaries(raw_path: Path, output_geojson: Path) -> None:
    import geopandas as gpd

    gdf = clean_column_names(gpd.read_file(raw_path))
    name_candidates = ["lga_name", "vic_lga_name", "name", "lganame"]
    name_col = next((column for column in name_candidates if column in gdf.columns), None)
    if name_col is None:
        raise ValueError(f"Could not infer LGA name column from: {list(gdf.columns)}")

    output = gdf[[name_col, "geometry"]].rename(columns={name_col: "lga_name"}).to_crs("EPSG:4326")
    output_geojson.parent.mkdir(parents=True, exist_ok=True)
    output.to_file(output_geojson, driver="GeoJSON")


def standardise_table(input_csv: Path, output_csv: Path) -> pd.DataFrame:
    df = clean_column_names(pd.read_csv(input_csv))
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)
    return df
