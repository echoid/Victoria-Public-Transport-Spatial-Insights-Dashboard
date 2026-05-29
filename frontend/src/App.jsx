import { useEffect, useState } from "react";
import { geocode, getLocationReport } from "./api/client.js";
import SearchBox from "./components/SearchBox.jsx";
import MapView from "./components/MapView.jsx";
import LocationSummary from "./components/LocationSummary.jsx";
import ReportTabs from "./components/ReportTabs.jsx";
import ExportShare from "./components/ExportShare.jsx";

const DEFAULT_LOCATION = {
  lat: -37.819,
  lon: 145.122,
  source: "demo",
  label: "Box Hill VIC"
};

const DEFAULT_LAYERS = {
  train: true,
  tram: true,
  bus: true,
  schools: true,
  health: true,
  retail: true,
  parks_sport: true,
  planning: false
};

export default function App() {
  const [query, setQuery] = useState("Box Hill VIC");
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [radius, setRadius] = useState(2000);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function generateReport(location = selectedLocation, nextRadius = radius) {
    if (!location) return;
    setLoading(true);
    setError("");
    try {
      const payload = await getLocationReport({ lat: location.lat, lon: location.lon, radius: nextRadius });
      setReport(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch() {
    setSearching(true);
    setError("");
    try {
      const payload = await geocode(query);
      setGeocodeResults(payload.results);
      if (payload.results.length === 1) {
        selectGeocodeResult(payload.results[0]);
      }
    } catch (err) {
      setError("Geocoding is unavailable. You can still click directly on the map.");
    } finally {
      setSearching(false);
    }
  }

  function selectGeocodeResult(result) {
    const location = { lat: Number(result.lat), lon: Number(result.lon), source: "search", label: result.display_name };
    setSelectedLocation(location);
    setGeocodeResults([]);
    generateReport(location, radius);
  }

  function selectMapPoint(location) {
    setSelectedLocation(location);
    setGeocodeResults([]);
    generateReport(location, radius);
  }

  function changeRadius(event) {
    const nextRadius = Number(event.target.value);
    setRadius(nextRadius);
    generateReport(selectedLocation, nextRadius);
  }

  useEffect(() => {
    generateReport(DEFAULT_LOCATION, radius);
  }, []);

  return (
    <main>
      <header className="app-header">
        <div>
          <p>Open-data-first location intelligence</p>
          <h1>Victoria Location Intelligence Dashboard</h1>
          <span>Search or click any location to generate a transport, amenity and planning context report.</span>
        </div>
        <div className="radius-control">
          <label htmlFor="radius">Search radius</label>
          <select id="radius" value={radius} onChange={changeRadius}>
            <option value="400">400m</option>
            <option value="800">800m</option>
            <option value="2000">2km</option>
            <option value="5000">5km</option>
          </select>
        </div>
      </header>

      <div className="dashboard">
        <div className="left-column">
          <SearchBox
            query={query}
            setQuery={setQuery}
            onSearch={runSearch}
            results={geocodeResults}
            onSelectResult={selectGeocodeResult}
            loading={searching}
            error={error}
          />
          <MapView
            selectedLocation={selectedLocation}
            report={report}
            radius={radius}
            layers={layers}
            setLayers={setLayers}
            onSelect={selectMapPoint}
          />
        </div>
        <aside className="right-column">
          {loading ? <div className="status">Generating location report...</div> : null}
          <LocationSummary report={report} selectedLocation={selectedLocation} />
          <ReportTabs report={report} />
          <ExportShare report={report} />
        </aside>
      </div>
    </main>
  );
}
