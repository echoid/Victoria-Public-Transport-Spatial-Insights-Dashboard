import { useEffect, useRef, useState } from "react";
import { geocode, getAreaBoundary, getLocationReport, getRouteDetails } from "./api/client.js";
import { categoryLabel, getText } from "./content.js";
import SearchBox from "./components/SearchBox.jsx";
import MapView from "./components/MapView.jsx";
import LocationSummary from "./components/LocationSummary.jsx";
import ReportTabs from "./components/ReportTabs.jsx";
import ExportShare from "./components/ExportShare.jsx";
import ProjectGuide from "./components/ProjectGuide.jsx";
import LayerToggle from "./components/LayerToggle.jsx";
import CategoryIcon from "./components/CategoryIcon.jsx";
import { metres, score } from "./utils/formatters.js";

const DEFAULT_LAYERS = {
  metro_train_stops: true,
  regional_train_stops: true,
  other_train_stops: false,
  metro_tram_stops: true,
  myki_bus_stops: true,
  regional_bus_stops: true,
  regional_coach_stops: false,
  skybus_stops: false,
  other_bus_stops: true,
  metro_train_lines: false,
  regional_train_lines: false,
  other_train_lines: false,
  metro_tram_lines: false,
  myki_bus_lines: false,
  regional_bus_lines: false,
  regional_coach_lines: false,
  skybus_lines: false,
  other_bus_lines: false,
  schools: true,
  health: true,
  retail: true,
  parks_sport: true,
  planning: false
};

function featureLayerEnabled(feature, layers) {
  if (!feature) return false;
  if (["train", "tram", "bus"].includes(feature.category)) {
    return Boolean(layers[`${feature.transport_kind || feature.category}_stops`]);
  }
  if (feature.category === "school") return Boolean(layers.schools);
  if (feature.category === "health") return Boolean(layers.health);
  if (feature.category === "retail") return Boolean(layers.retail);
  if (feature.category === "sport") return Boolean(layers.parks_sport);
  return false;
}

const UI_COPY = {
  en: {
    appName: "Victoria Location Intelligence",
    menu: "Menu",
    guide: "Guide",
    close: "Close",
    hideSummary: "Hide summary",
    showSummary: "Show summary",
    addCandidate: "Save location",
    clear: "Clear",
    selectedPoint: "Selected point",
    clickedFeature: "Map feature",
    featureHint: "Click transport and amenity markers to inspect details here.",
    useAsLocation: "Analyse this marker",
    saved: "Saved",
    radius: "Radius",
    liveScore: "Overall",
    transport: "Transport",
    amenities: "Amenities",
    planning: "Planning",
    locationSummary: "Location Summary"
  },
  zh: {
    appName: "维州地点智能分析",
    menu: "菜单",
    guide: "说明",
    close: "关闭",
    hideSummary: "隐藏 summary",
    showSummary: "显示 summary",
    addCandidate: "保存地点",
    clear: "清除",
    selectedPoint: "当前选点",
    clickedFeature: "地图要素",
    featureHint: "点击交通、学校、医疗、零售或公园 marker 后，这里会显示详情。",
    useAsLocation: "分析这个 marker",
    saved: "已保存",
    radius: "半径",
    liveScore: "综合",
    transport: "交通",
    amenities: "配套",
    planning: "规划",
    locationSummary: "地点 summary"
  }
};

function MiniMetric({ label, value }) {
  return (
    <div className="mini-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MarkerInfoPanel({ feature, selectedLocation, report, locale, text, copy, onClose, onAnalyseFeature }) {
  if (!feature) {
    return null;
  }

  return (
    <aside className="marker-drawer">
      <div className="drawer-title-row">
        <div>
          <span className="eyebrow">{copy.clickedFeature}</span>
          <h2>{feature.name}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label={copy.close}>
          x
        </button>
      </div>

      <div className="feature-category-line">
        <CategoryIcon category={feature.category} label={categoryLabel(feature.category, locale)} />
        <span>{categoryLabel(feature.category, locale)}</span>
      </div>

      <div className="detail-list">
        <div>
          <span>Distance from selected point</span>
          <strong>{metres(feature.distance_m, locale)}</strong>
        </div>
        <div>
          <span>Coordinates</span>
          <strong>{feature.lat.toFixed(5)}, {feature.lon.toFixed(5)}</strong>
        </div>
        {feature.routes ? (
          <div>
            <span>Routes</span>
            <strong>{feature.routes}</strong>
          </div>
        ) : null}
        {feature.mode ? (
          <div>
            <span>Mode</span>
            <strong>{feature.mode_label || feature.mode}</strong>
          </div>
        ) : null}
        {feature.stop_id ? (
          <div>
            <span>Stop ID</span>
            <strong>{feature.stop_id}</strong>
          </div>
        ) : null}
        {feature.nhsd_service_type ? (
          <div>
            <span>Health service</span>
            <strong>{feature.nhsd_service_type}</strong>
          </div>
        ) : null}
        {feature.school_type ? (
          <div>
            <span>School type</span>
            <strong>{feature.school_type}</strong>
          </div>
        ) : null}
        {feature.education_sector ? (
          <div>
            <span>Sector</span>
            <strong>{feature.education_sector}</strong>
          </div>
        ) : null}
        {feature.address ? (
          <div>
            <span>Address</span>
            <strong>{feature.address}</strong>
          </div>
        ) : null}
        {feature.lga ? (
          <div>
            <span>LGA</span>
            <strong>{feature.lga}</strong>
          </div>
        ) : null}
        {feature.suburb ? (
          <div>
            <span>Suburb</span>
            <strong>
              {feature.suburb}
              {feature.postcode ? ` ${feature.postcode}` : ""}
            </strong>
          </div>
        ) : null}
        {feature.source ? (
          <div>
            <span>Source</span>
            <strong>{feature.source}</strong>
          </div>
        ) : null}
      </div>

      <button className="primary-action drawer-action" onClick={() => onAnalyseFeature(feature)}>
        {copy.useAsLocation}
      </button>
    </aside>
  );
}

export default function App() {
  const [locale, setLocale] = useState("en");
  const [showGuide, setShowGuide] = useState(false);
  const [query, setQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [radius, setRadius] = useState(2000);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [report, setReport] = useState(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [routeDetails, setRouteDetails] = useState({ options: [], lines: [], stops: [] });
  const [candidates, setCandidates] = useState([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const searchRequestRef = useRef(0);
  const areaRequestRef = useRef(0);
  const text = getText(locale);
  const copy = UI_COPY[locale] || UI_COPY.en;

  async function generateReport(location = selectedLocation, nextRadius = radius) {
    if (!location) return;
    setLoading(true);
    setError("");
    try {
      const payload = await getLocationReport({ lat: location.lat, lon: location.lon, radius: nextRadius });
      setReport(payload);
      setSelectedRouteIds([]);
      setRouteDetails({ options: [], lines: [], stops: [] });
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
    } catch {
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

  function selectLocation(location, label) {
    const nextLocation = { ...location, label: label || location.label };
    setSelectedLocation(nextLocation);
    setSelectedFeature(null);
    setGeocodeResults([]);
    generateReport(nextLocation, radius);
    resolveArea(nextLocation);
  }

  function selectGeocodeResult(result) {
    selectLocation(
      { lat: Number(result.lat), lon: Number(result.lon), source: "search", label: result.display_name },
      result.display_name
    );
  }

  function selectMapPoint(location) {
    selectLocation(location, "Selected map point");
  }

  function analyseFeature(feature) {
    selectLocation({ lat: feature.lat, lon: feature.lon, source: "feature", label: feature.name }, feature.name);
  }

  function changeRadius(event) {
    const nextRadius = Number(event.target.value);
    setRadius(nextRadius);
    generateReport(selectedLocation, nextRadius);
  }

  function addCurrentCandidate() {
    if (!report || !selectedLocation) return;
    const id = `${selectedLocation.lat.toFixed(5)}:${selectedLocation.lon.toFixed(5)}`;
    const candidate = {
      id,
      location: { ...selectedLocation },
      label: report.location?.address || selectedLocation.label || report.location?.suburb || id,
      report
    };
    setCandidates((current) => [candidate, ...current.filter((item) => item.id !== id)].slice(0, 5));
  }

  function clearSelection() {
    setSelectedLocation(null);
    setSelectedArea(null);
    setSelectedFeature(null);
    setReport(null);
    setSelectedRouteIds([]);
    setRouteDetails({ options: [], lines: [], stops: [] });
    setGeocodeResults([]);
    setError("");
  }

  useEffect(() => {
    if (showGuide) return undefined;
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setGeocodeResults([]);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      runSearch({ auto: true });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query, showGuide]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedRouteIds.length) {
      setRouteDetails({ options: [], lines: [], stops: [] });
      return undefined;
    }

    getRouteDetails({ routeIds: selectedRouteIds, origin: selectedLocation })
      .then((details) => {
        if (!cancelled) setRouteDetails(details);
      })
      .catch(() => {
        if (!cancelled) setRouteDetails({ options: [], lines: [], stops: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRouteIds, selectedLocation]);

  useEffect(() => {
    if (selectedFeature && !featureLayerEnabled(selectedFeature, layers)) {
      setSelectedFeature(null);
    }
  }, [layers, selectedFeature]);

  if (showGuide) {
    return (
      <main className="guide-shell">
        <div className="guide-topbar">
          <button className="secondary-action" onClick={() => setShowGuide(false)}>{copy.close}</button>
          <div className="segmented-control lang-control" aria-label={text.header.language}>
            <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>EN</button>
            <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>中文</button>
          </div>
        </div>
        <ProjectGuide text={text} />
      </main>
    );
  }

  return (
    <main className="map-app">
      <MapView
        selectedLocation={selectedLocation}
        selectedArea={selectedArea}
        selectedFeature={selectedFeature}
        report={report}
        radius={radius}
        layers={layers}
        selectedRouteIds={selectedRouteIds}
        routeDetails={routeDetails}
        onSelect={selectMapPoint}
        onFeatureSelect={setSelectedFeature}
        text={text}
        locale={locale}
        candidates={candidates}
      />

      <div className="map-control-bar">
        <button className="menu-button" onClick={() => setShowGuide(true)}>{copy.menu}</button>
        <SearchBox
          query={query}
          setQuery={setQuery}
          onSearch={runSearch}
          results={geocodeResults}
          onSelectResult={selectGeocodeResult}
          loading={searching}
          error={error}
          text={text}
          compact
          className="map-search"
        />
        <div className="control-cluster">
          <label htmlFor="map-radius">{copy.radius}</label>
          <select id="map-radius" value={radius} onChange={changeRadius}>
            <option value="400">400m</option>
            <option value="800">800m</option>
            <option value="2000">2km</option>
            <option value="5000">5km</option>
          </select>
        </div>
        <button className="secondary-action" onClick={addCurrentCandidate} disabled={!report}>{copy.addCandidate}</button>
        <button className="secondary-action" onClick={clearSelection}>{copy.clear}</button>
        <div className="segmented-control lang-control compact-lang" aria-label={text.header.language}>
          <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>EN</button>
          <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>中</button>
        </div>
      </div>

      <div className="map-layer-strip">
        <LayerToggle
          layers={layers}
          setLayers={setLayers}
          text={text}
          locale={locale}
          routeOptions={report?.map_features?.route_options || []}
          selectedRouteIds={selectedRouteIds}
          setSelectedRouteIds={setSelectedRouteIds}
        />
      </div>

      <MarkerInfoPanel
        feature={selectedFeature}
        selectedLocation={selectedLocation}
        report={report}
        locale={locale}
        text={text}
        copy={copy}
        onClose={() => setSelectedFeature(null)}
        onAnalyseFeature={analyseFeature}
      />

      <div className="map-bottom-status">
        <MiniMetric label={copy.liveScore} value={score(report?.scores?.overall_score)} />
        <MiniMetric label={copy.transport} value={score(report?.scores?.transport_score)} />
        <MiniMetric label={copy.amenities} value={score(report?.scores?.amenity_score)} />
        <MiniMetric label={copy.saved} value={candidates.length} />
      </div>

      {summaryOpen ? (
        <aside className="summary-panel">
          <div className="summary-panel-header">
            <div>
              <span className="eyebrow">{copy.locationSummary}</span>
              <h2>{report?.location?.suburb || copy.selectedPoint}</h2>
            </div>
            <button className="icon-button" onClick={() => setSummaryOpen(false)} aria-label={copy.hideSummary}>x</button>
          </div>
          {loading ? <div className="status">{text.status.loading}</div> : null}
          <LocationSummary report={report} selectedLocation={selectedLocation} text={text} locale={locale} />
          <ReportTabs report={report} text={text} locale={locale} />
          <ExportShare report={report} text={text} />
        </aside>
      ) : (
        <button className="summary-fab" onClick={() => setSummaryOpen(true)}>{copy.showSummary}</button>
      )}
    </main>
  );
}
