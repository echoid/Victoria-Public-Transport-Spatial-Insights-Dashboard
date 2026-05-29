# Victoria Public Transport Spatial Insights Dashboard

This project is a lightweight geospatial analytics dashboard built with Python, pandas, GeoPandas-style processing, Plotly, Folium and Streamlit. It uses Victorian open transport data concepts to explore public transport stop distribution, service coverage and patronage trends by mode.

The project is designed as a portfolio-ready MVP for Victorian Government / Department of Transport and Planning Senior Data Scientist applications. It demonstrates spatial data processing, time-series analysis, dashboard development and communication of decision-ready insights for public-sector transport planning.

## Live Links

- GitHub Pages project page: https://echoid.github.io/Victoria-Public-Transport-Spatial-Insights-Dashboard/
- Streamlit dashboard: deploy `app.py` with Streamlit Community Cloud after pushing this repository.

GitHub Pages can host the static project page, but it cannot run the Streamlit Python server. The recommended deployment pattern is GitHub Pages for the portfolio landing page and Streamlit Community Cloud for the interactive dashboard.

## Questions Answered

1. Where are public transport stops and routes concentrated across Victoria?
2. How has public transport patronage changed over time by mode?
3. Which areas appear to have stronger or weaker public transport access based on simple spatial indicators?

## Dashboard Features

- Interactive Folium map of Victorian public transport stops by mode.
- Mode filter for train, tram, bus and coach examples.
- Monthly patronage trend chart by mode.
- Mode share area chart.
- LGA-level stop count, stop density and mode diversity indicators.
- Ranked LGA access table.
- Downloadable LGA access summary CSV.

## Project Structure

```text
vic-transport-spatial-dashboard/
|-- app.py
|-- requirements.txt
|-- README.md
|-- .github/
|   `-- workflows/
|       `-- pages.yml
|-- .streamlit/
|   `-- config.toml
|-- docs/
|   `-- index.html
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

The deployed MVP includes compact sample files in `data/processed/` so the app remains fast and reliable. These sample files are illustrative and are not a full official extract.

Recommended official sources for a production refresh:

- [Transport Victoria Open Data Portal: Public Transport Lines and Stops](https://discover.data.vic.gov.au/dataset/public-transport-lines-and-stops).
  - Public Transport Stops GeoJSON.
  - Public Transport Lines GeoJSON.
- [Transport Victoria Open Data Portal: GTFS Schedule](https://discover.data.vic.gov.au/dataset/gtfs-schedule).
- [Victorian Government Data Vic: Monthly public transport patronage by mode](https://discover.data.vic.gov.au/dataset/monthly-public-transport-patronage-by-mode).
- [Victorian Government Data Vic: Vicmap Admin Local Government Area Polygon](https://discover.data.vic.gov.au/dataset/vicmap-admin-local-government-area-lga-polygon-aligned-to-topographic-features).

## Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Refresh Data

Download selected official source files into `data/raw/`:

```bash
python -m src.data_download --source stops
python -m src.data_download --source lines
python -m src.data_download --source patronage
python -m src.data_download --source gtfs
```

Clean patronage data:

```python
from pathlib import Path
from src.data_cleaning import clean_patronage

clean_patronage(
    Path("data/raw/monthly_public_transport_patronage_by_mode.csv"),
    Path("data/processed/patronage_long.csv"),
)
```

For the full GIS workflow, download the current LGA boundary resource from Data Vic / DataShare, place the original file in `data/raw/`, adapt `src/data_cleaning.py` for the selected boundary format, then run spatial joins in `src/spatial_analysis.py`. Large raw geospatial files should stay out of git.

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

## Deployment

### Streamlit Community Cloud

1. Push this repository to GitHub.
2. In Streamlit Community Cloud, create a new app from the repository.
3. Set the main file path to `app.py`.
4. Use `requirements.txt` as the dependency file.

### GitHub Pages

This repository includes `.github/workflows/pages.yml`, which publishes the static site in `docs/` whenever `main` is pushed. In the repository settings, enable GitHub Pages with GitHub Actions as the source.

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
- Add downloadable CSV summaries for each tab.
- Add formal MLflow experiment tracking for patronage forecasting experiments.
