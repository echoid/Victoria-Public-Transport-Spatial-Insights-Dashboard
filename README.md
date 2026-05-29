# Victoria Location Intelligence Dashboard

Interactive geospatial decision-support dashboard for comparing residential locations in Victoria based on transport access, public facilities, nearby amenities and distance to personal destinations.

The project is motivated by a practical home-search use case: compare candidate property locations with spatial evidence rather than relying only on listing photos, suburb reputation or intuition.

## 2026 Upgrade: No-CSV Dynamic MVP

The project now includes a React + Vite frontend and FastAPI backend for a free, open-data-first location intelligence workflow. Users can search for a Victorian address/suburb/landmark or click directly on a Leaflet map, then generate an immediate report without uploading a CSV.

The new MVP supports:

- OpenStreetMap Leaflet base map with attribution.
- Map-click location selection, marker placement and 400m / 800m / 2km buffers.
- Backend `/api/geocode` endpoint using OpenStreetMap Nominatim with in-memory caching.
- Backend `/api/location-report` endpoint using bundled public transport and facility point data.
- Nearest train, tram and bus stop lookup.
- Transport stop counts within 400m, 800m and 2km.
- Nearby school, health, retail and sport/open-space counts.
- Transparent transport, amenity, planning-context and overall scores.
- Layer toggles, report tabs, summary cards, JSON export and copyable summary text.

The legacy Streamlit app and static GitHub Pages dashboard remain available for comparison and portfolio continuity.

## Static MVP Deployment

The deployed GitHub Pages site is a fully static MVP. It does not require a continuously running backend.

Static mode works by bundling `home_location_dashboard_data.json` with the frontend and calculating reports in the browser:

- Map clicks are supported. The browser captures the clicked latitude/longitude and calculates nearest features from the bundled point dataset.
- Address search first checks bundled demo locations, then calls OpenStreetMap Nominatim directly from the browser.
- The report, score breakdown, map layers and export controls run client-side.

This means the app can be hosted for free on GitHub Pages. The trade-off is that report quality depends on the bundled data coverage; locations far outside the current Melbourne/Victorian sample points may return sparse or less meaningful nearby-feature results until larger datasets are bundled or a backend/PostGIS service is enabled.

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
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   |-- geocoding.py
|   |   |-- spatial.py
|   |   |-- scoring.py
|   |   `-- cache.py
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- api/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
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

Dynamic React + FastAPI MVP:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python -m uvicorn backend.app.main:app --reload
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`.

Static GitHub Pages build:

```bash
cd frontend
npm install
npm run build:static
```

The static build writes to `docs/`, which is deployed by the GitHub Pages workflow on every push to `main`.

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
- The dynamic MVP geocodes only after an explicit search action; it does not call Nominatim on every keystroke.
- Planning zones and overlays are not imported yet; the Planning tab is context/disclaimer-only until Vicmap Planning data is added.
- The MVP does not use Google Maps, Google Places, paid routing APIs, commercial listing APIs, login, payments or PDF export.

## Next Phases

- Add an Overpass client for OSM schools, health services, supermarkets, food, parks and sport amenities with rounded-coordinate caching.
- Import Vicmap Planning zones and overlays for point-in-polygon planning context.
- Move larger datasets into PostGIS or Supabase once the local-file MVP is stable.
- Add adjustable scoring weights and richer score explanations.
- Add screenshots to the README after deployment.

## Portfolio Summary

Built a Python-based geospatial decision-support dashboard to compare residential property locations in Victoria using open transport, amenity and boundary-style datasets. The tool allows users to upload candidate property locations, assess nearby public transport and facilities, calculate distance to target destinations, and generate transparent location scores. The project demonstrates GIS analysis, open data integration, dashboard development and decision-oriented communication for real-world planning and property search use cases.
