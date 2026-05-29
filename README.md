# Home Location Intelligence Dashboard for Victoria

Interactive geospatial decision-support dashboard for comparing residential locations in Victoria based on transport access, public facilities, nearby amenities and distance to personal destinations.

The project is motivated by a practical home-search use case: compare candidate property locations with spatial evidence rather than relying only on listing photos, suburb reputation or intuition.

## Live Links

- GitHub Pages dashboard: https://echoid.github.io/Victoria-Public-Transport-Spatial-Insights-Dashboard/
- Portfolio home page: https://echoid.github.io/

## What It Does

- Compare manually supplied candidate properties side by side.
- Map candidate locations with nearby transport stops, schools, health services, sport facilities and retail anchors.
- Calculate nearest train, tram and bus stop distances.
- Count public transport stops within 400m, 800m and 2km.
- Count schools, health services, sport facilities and retail anchors within decision-relevant radii.
- Compare distance to target destinations such as Melbourne CBD, Deakin Burwood, University of Melbourne and Melbourne Airport.
- Generate transparent transport, amenity, commute and overall location scores.
- Switch between English and Chinese UI text in the GitHub Pages dashboard.

## Data

The deployed static dashboard uses real spatial data bundled from the earlier COMP90024 cloud analytics project:

- PTV / Transport Victoria metro train, tram and bus stop extracts.
- Victorian school location points.
- AIHW hospital / health service points.
- Victorian sport facility points.
- Victorian LGA profile indicators, including distance and travel time to Melbourne.
- Manually curated retail anchors for the sample home-search scenario.

Property candidates are manually supplied examples and are not scraped from commercial listing websites.

## Sample Inputs

```text
data/sample_inputs/sample_property_candidates.csv
data/sample_inputs/default_target_destinations.csv
```

Candidate property CSV fields:

```text
property_id,address,suburb,price,bedrooms,bathrooms,car_spaces,property_type,latitude,longitude,url,notes
```

The static site supports uploading a simple CSV with `latitude`/`longitude` or `lat`/`lon` columns. A fuller Streamlit version can extend this into a complete user-upload workflow.

## Scoring

The scoring system is intentionally transparent:

- `transport_score`: nearest train distance, stops within 800m, mode diversity and nearest bus distance.
- `amenity_score`: retail, school, health, sport and nearest-school access.
- `commute_score`: weighted straight-line distance to target destinations.
- `overall_score`: 35% transport, 35% amenity, 30% commute.

Distances are haversine straight-line distances in kilometres. This keeps the MVP open-data-first and avoids requiring paid routing APIs.

## Project Structure

```text
home-location-intelligence-vic/
|-- app.py
|-- requirements.txt
|-- README.md
|-- docs/
|   |-- index.html
|   `-- data/
|       `-- home_location_dashboard_data.json
|-- data/
|   |-- raw/
|   |-- processed/
|   |   `-- home_location_dashboard_data.json
|   `-- sample_inputs/
|       |-- sample_property_candidates.csv
|       `-- default_target_destinations.csv
|-- src/
|-- notebooks/
`-- outputs/
```

## Run Locally

Static GitHub Pages version:

```bash
python -m http.server 8765 --directory docs
```

Streamlit prototype:

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Cloud Analytics And Model Lifecycle Notes

The current dashboard is intentionally lightweight, but the project can be positioned as a scalable data product:

- Use PySpark or Databricks to refresh large GTFS, OSM, population and property candidate datasets.
- Store curated stops, POIs, property candidates and distance matrices as Delta tables.
- Track scoring-weight experiments, routing-model variants or commute-time forecasting with MLflow.
- Log data versions, feature-generation parameters and output metrics for reproducibility.
- Serve dashboard-ready aggregates to Streamlit or a static Pages build.

## Limitations

- Distances are straight-line approximations unless a routing API is enabled.
- Public transport access is estimated using stop proximity and does not fully reflect service frequency, reliability or travel time.
- Retail anchors in the static demo are curated public-map points; a production version should refresh POIs with OSMnx or Overpass.
- Property data is user-supplied and not scraped from realestate.com.au, Domain or other commercial listing platforms.
- Scores are simplified decision-support indicators, not objective property valuation metrics.
- The tool is for exploratory analysis only and should not replace professional property, transport or planning advice.

## Portfolio Summary

Built a Python-based geospatial decision-support dashboard to compare residential property locations in Victoria using open transport, amenity and boundary-style datasets. The tool allows users to upload candidate property locations, assess nearby public transport and facilities, calculate distance to target destinations, and generate transparent location scores. The project demonstrates GIS analysis, open data integration, dashboard development and decision-oriented communication for real-world planning and property search use cases.
