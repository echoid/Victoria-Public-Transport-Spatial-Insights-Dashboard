# Victoria Public Transport Spatial Insights Dashboard

This project is a lightweight geospatial analytics dashboard built with Python, GeoPandas-style workflows and Streamlit. It uses Victorian open transport data concepts to explore public transport stop distribution, service coverage and patronage trends by mode. The project demonstrates practical capability in spatial data processing, time-series analysis, dashboard development and communication of decision-ready insights for public-sector transport planning.

The deployed MVP includes compact sample data so the app remains fast and reliable on Streamlit Community Cloud. The source modules are structured so the sample files can be replaced with official Transport Victoria, Data Vic and Vicmap extracts.

## Live Dashboard

After deployment, add the Streamlit Community Cloud URL here.

## What The Dashboard Answers

1. Where are public transport stops and routes concentrated across Victoria?
2. How has public transport patronage changed over time by mode?
3. Which areas appear to have stronger or weaker public transport access based on simple spatial indicators?

## Features

- Interactive Folium map of sample Victorian public transport stops by mode.
- LGA-level stop density and mode diversity indicators.
- Patronage trend chart by mode with year filtering.
- Mode share area chart.
- Ranked LGA access table.
- Modular Python code for data download, cleaning, spatial analysis and charting.

## Project Structure

```text
vic-transport-spatial-dashboard/
|-- app.py
|-- requirements.txt
|-- README.md
|-- data/
|   |-- raw/
|   `-- processed/
|-- notebooks/
|   `-- exploratory_analysis.ipynb
|-- src/
|   |-- data_download.py
|   |-- data_cleaning.py
|   |-- spatial_analysis.py
|   |-- charts.py
|   `-- utils.py
`-- outputs/
    |-- figures/
    `-- processed_summary_tables/
```

## Data Sources

Recommended official sources for a full production refresh:

- [Transport Victoria Open Data Portal: Public Transport Lines and Stops](https://discover.data.vic.gov.au/dataset/public-transport-lines-and-stops). GeoJSON stops and lines; metadata last updated 5 March 2026.
- [Transport Victoria Open Data Portal: GTFS Schedule](https://discover.data.vic.gov.au/dataset/gtfs-schedule). Static timetable ZIP; metadata last updated 23 May 2026.
- [Victorian Government Data Vic: Monthly public transport patronage by mode](https://discover.data.vic.gov.au/dataset/monthly-public-transport-patronage-by-mode). Monthly CSV; metadata last updated 15 May 2026.
- [Victorian Government Data Vic: Vicmap Admin Local Government Area Polygon](https://discover.data.vic.gov.au/dataset/vicmap-admin-local-government-area-lga-polygon-aligned-to-topographic-features). LGA boundary formats including SHP and WFS; metadata last updated 16 May 2026.

The repository ships with small sample files in `data/processed/` for portfolio demonstration and deployment stability. These are not a full official extract.

## Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Refresh Data

The patronage and GTFS downloader is in `src/data_download.py`.

```bash
python -m src.data_download --source patronage
python -m src.data_download --source gtfs
```

For the full GIS workflow, download the current public transport lines/stops and LGA boundary resources from the official portals, place the original files in `data/raw/`, then adapt the cleaning step for the selected file format. Large raw geospatial files should stay out of git.

## Analytical Outputs

- Stop count by LGA.
- Stop density per square kilometre.
- Mode diversity per LGA.
- Indicative 800m catchment percentage in the sample summary.
- Monthly patronage by mode.
- Mode share over time.

## Cloud Analytics And Model Lifecycle Notes

This MVP does not need PySpark, Databricks or MLflow because the sample and typical open-data extracts are small enough for pandas, GeoPandas and Streamlit. For a larger Department of Transport and Planning workflow, the same design can scale as follows:

- Use PySpark or Databricks for large GTFS, smartcard, AVL or multi-year operational datasets.
- Store curated Delta tables for stops, trips, service calendars, patronage and boundary joins.
- Use MLflow to track forecasting, clustering or accessibility model experiments.
- Log dataset versions, parameters, metrics and generated figures for reproducible model governance.
- Deploy dashboard-ready aggregates rather than exposing heavy raw data processing in the Streamlit app.

## Limitations

- The dashboard uses open aggregate datasets and does not represent internal DTP modelling.
- The deployed sample is illustrative and should be replaced with official full extracts for formal analysis.
- Patronage data is aggregated by mode and month, so it does not support individual route-level demand modelling.
- Stop density is a simple proxy for access and does not account for service frequency, travel time, reliability, accessibility or population need.
- Catchment analysis using buffers is approximate and does not represent real walking network distance.
- Further work could integrate population data, land use, service frequency and network-based accessibility.

## Stretch Goals

- Add ABS Census population data and calculate stops per 10,000 residents.
- Add SA2-level analysis instead of LGA-level analysis.
- Estimate service frequency from GTFS trips.
- Add weekday vs weekend service intensity.
- Add simple forecasting of patronage trends.
- Add downloadable CSV summaries.
- Add formal MLflow experiment tracking for patronage forecasting experiments.
