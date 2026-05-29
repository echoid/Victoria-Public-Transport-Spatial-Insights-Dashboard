import { useEffect, useRef, useState } from "react";
import { geocode, getAreaBoundary, getLocationReport } from "./api/client.js";
import { getText } from "./content.js";
import SearchBox from "./components/SearchBox.jsx";
import MapView from "./components/MapView.jsx";
import LocationSummary from "./components/LocationSummary.jsx";
import ReportTabs from "./components/ReportTabs.jsx";
import ExportShare from "./components/ExportShare.jsx";
import ProjectGuide from "./components/ProjectGuide.jsx";

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
  const [locale, setLocale] = useState("en");
  const [activePage, setActivePage] = useState("dashboard");
  const [query, setQuery] = useState("Box Hill VIC");
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [selectedArea, setSelectedArea] = useState(null);
  const [radius, setRadius] = useState(2000);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const searchRequestRef = useRef(0);
  const areaRequestRef = useRef(0);
  const text = getText(locale);

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

  async function runSearch(options = {}) {
    const { auto = false } = options;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setGeocodeResults([]);
      return;
    }

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    setSearching(true);
    setError("");
    try {
      const payload = await geocode(trimmed);
      if (requestId !== searchRequestRef.current) return;
      setGeocodeResults(payload.results);
      if (!auto && payload.results.length === 1) {
        selectGeocodeResult(payload.results[0]);
      }
    } catch (err) {
      if (requestId !== searchRequestRef.current) return;
      setError(text.search.unavailable);
    } finally {
      if (requestId === searchRequestRef.current) {
        setSearching(false);
      }
    }
  }

  async function resolveArea(location) {
    if (!location) return;
    const requestId = areaRequestRef.current + 1;
    areaRequestRef.current = requestId;
    setSelectedArea(null);
    const area = await getAreaBoundary({ lat: location.lat, lon: location.lon });
    if (requestId === areaRequestRef.current) {
      setSelectedArea(area);
    }
  }

  function selectGeocodeResult(result) {
    const location = { lat: Number(result.lat), lon: Number(result.lon), source: "search", label: result.display_name };
    setSelectedLocation(location);
    setGeocodeResults([]);
    generateReport(location, radius);
    resolveArea(location);
  }

  function selectMapPoint(location) {
    setSelectedLocation(location);
    setGeocodeResults([]);
    generateReport(location, radius);
    resolveArea(location);
  }

  function changeRadius(event) {
    const nextRadius = Number(event.target.value);
    setRadius(nextRadius);
    generateReport(selectedLocation, nextRadius);
  }

  useEffect(() => {
    generateReport(DEFAULT_LOCATION, radius);
    resolveArea(DEFAULT_LOCATION);
  }, []);

  useEffect(() => {
    if (activePage !== "dashboard") return undefined;
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setGeocodeResults([]);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      runSearch({ auto: true });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [query, activePage]);

  return (
    <main>
      <header className="app-header">
        <div>
          <p>{text.header.eyebrow}</p>
          <h1>{text.header.title}</h1>
          <span>{text.header.description}</span>
        </div>
        <div className="header-controls">
          <div className="toggle-row">
            <div className="segmented-control">
              <button className={activePage === "dashboard" ? "active" : ""} onClick={() => setActivePage("dashboard")}>
                {text.nav.dashboard}
              </button>
              <button className={activePage === "guide" ? "active" : ""} onClick={() => setActivePage("guide")}>
                {text.nav.guide}
              </button>
            </div>
            <div className="segmented-control lang-control" aria-label={text.header.language}>
              <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>EN</button>
              <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>中文</button>
            </div>
          </div>
          {activePage === "dashboard" ? (
            <div className="radius-control">
              <label htmlFor="radius">{text.header.radius}</label>
              <select id="radius" value={radius} onChange={changeRadius}>
                <option value="400">400m</option>
                <option value="800">800m</option>
                <option value="2000">2km</option>
                <option value="5000">5km</option>
              </select>
            </div>
          ) : null}
        </div>
      </header>

      {activePage === "guide" ? (
        <ProjectGuide text={text} />
      ) : (
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
              text={text}
            />
            <MapView
              selectedLocation={selectedLocation}
              selectedArea={selectedArea}
              report={report}
              radius={radius}
              layers={layers}
              setLayers={setLayers}
              onSelect={selectMapPoint}
              text={text}
              locale={locale}
            />
          </div>
          <aside className="right-column">
            {loading ? <div className="status">{text.status.loading}</div> : null}
            <LocationSummary report={report} selectedLocation={selectedLocation} text={text} locale={locale} />
            <ReportTabs report={report} text={text} locale={locale} />
            <ExportShare report={report} text={text} />
          </aside>
        </div>
      )}
    </main>
  );
}
