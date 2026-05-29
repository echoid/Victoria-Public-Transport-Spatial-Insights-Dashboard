import { useEffect, useRef, useState } from "react";
import { geocode, getAreaBoundary, getLocationReport } from "./api/client.js";
import { getText } from "./content.js";
import { metres, score } from "./utils/formatters.js";
import SearchBox from "./components/SearchBox.jsx";
import MapView from "./components/MapView.jsx";
import LocationSummary from "./components/LocationSummary.jsx";
import ReportTabs from "./components/ReportTabs.jsx";
import ExportShare from "./components/ExportShare.jsx";
import ProjectGuide from "./components/ProjectGuide.jsx";
import LayerToggle from "./components/LayerToggle.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";

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

const DASHBOARD_COPY = {
  en: {
    brand: "Location Intelligence",
    brandSub: "Victoria property spatial intelligence",
    introEyebrow: "Victoria property spatial intelligence",
    introTitle: "Explore property locations with spatial intelligence.",
    introBody:
      "Search any Victorian location and inspect transport access, nearby amenities, area context, and planning-related signals in one interactive GIS-style workspace.",
    actions: {
      addCandidate: "Add current location",
      clearSelection: "Clear selection",
      guide: "Open guide"
    },
    metrics: {
      area: "Selected area",
      score: "Overall score",
      train: "Nearest train",
      school: "Schools within 2km"
    },
    searchTitle: "Search and select",
    searchBody: "Search by address, suburb, postcode, or place name, or click directly on the map to inspect a location.",
    compareTitle: "Candidate comparison",
    compareBody: "Save up to three candidate locations and compare transport, amenity, commute, and score side by side.",
    layersTitle: "Spatial layers",
    layersBody: "Toggle the core MVP layer groups for transport, amenities, and planning context.",
    analysisTitle: "Location analysis",
    analysisBody: "The right panel updates as you move across the map, so the spatial view and report stay connected.",
    comparison: {
      empty: "No candidate locations saved yet.",
      focus: "Focus",
      remove: "Remove",
      columns: {
        location: "Location",
        suburb: "Suburb",
        overall: "Overall",
        transport: "Transport",
        amenities: "Amenities",
        commute: "Commute"
      }
    }
  },
  zh: {
    brand: "地点智能",
    brandSub: "维州房产空间分析平台",
    introEyebrow: "维州房产空间分析平台",
    introTitle: "用空间数据看清一个地点。",
    introBody:
      "搜索维州任意地点后，在同一个 GIS 风格工作台里查看交通、配套、区域背景和规划相关信号。",
    actions: {
      addCandidate: "加入候选比较",
      clearSelection: "清除当前选择",
      guide: "打开项目说明"
    },
    metrics: {
      area: "当前区域",
      score: "综合分数",
      train: "最近火车站",
      school: "2 公里内学校数"
    },
    searchTitle: "搜索与选点",
    searchBody: "可以按地址、suburb、postcode 或地标搜索，也可以直接点击地图查看某个地点。",
    compareTitle: "候选地点比较",
    compareBody: "保存最多三个候选地点，并横向比较交通、配套、通勤和综合分数。",
    layersTitle: "空间图层",
    layersBody: "切换当前 MVP 里的交通、配套和规划背景图层。",
    analysisTitle: "地点分析",
    analysisBody: "右侧分析面板会随着地图选点实时更新，让地图和报告保持一致。",
    comparison: {
      empty: "还没有保存候选地点。",
      focus: "定位",
      remove: "移除",
      columns: {
        location: "地点",
        suburb: "区域",
        overall: "综合",
        transport: "交通",
        amenities: "配套",
        commute: "通勤"
      }
    }
  }
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
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const searchRequestRef = useRef(0);
  const areaRequestRef = useRef(0);
  const text = getText(locale);
  const dashboardText = DASHBOARD_COPY[locale] || DASHBOARD_COPY.en;

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

  const overviewStats = [
    {
      label: dashboardText.metrics.area,
      value: report?.location?.suburb || selectedArea?.label || DEFAULT_LOCATION.label
    },
    {
      label: dashboardText.metrics.score,
      value: score(report?.scores?.overall_score)
    },
    {
      label: dashboardText.metrics.train,
      value: metres(report?.transport?.nearest_train?.distance_m, locale)
    },
    {
      label: dashboardText.metrics.school,
      value: report?.profile?.schools_5km ?? report?.amenities?.counts?.schools?.within_2000m ?? (locale === "zh" ? "暂无数据" : "Not available")
    }
  ];

  function addCurrentCandidate() {
    if (!report || !selectedLocation) return;
    const id = `${selectedLocation.lat.toFixed(5)}:${selectedLocation.lon.toFixed(5)}`;
    const candidate = {
      id,
      location: { ...selectedLocation },
      label: report.location?.address || selectedLocation.label || report.location?.suburb || id,
      suburb: report.location?.suburb || text.summary.approximate,
      report
    };

    setCandidates((current) => {
      const next = [candidate, ...current.filter((item) => item.id !== id)];
      return next.slice(0, 3);
    });
  }

  function focusCandidate(candidate) {
    setSelectedLocation(candidate.location);
    setReport(candidate.report);
    setError("");
    setGeocodeResults([]);
    setQuery(candidate.label);
    resolveArea(candidate.location);
  }

  function removeCandidate(candidateId) {
    setCandidates((current) => current.filter((item) => item.id !== candidateId));
  }

  function clearSelection() {
    setSelectedLocation(null);
    setSelectedArea(null);
    setReport(null);
    setGeocodeResults([]);
    setError("");
  }

  return (
    <main>
      <header className="app-header">
        <div className="brand-lockup">
          <p>{dashboardText.brand}</p>
          <span>{dashboardText.brandSub}</span>
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
        <>
          <section className="platform-intro">
            <div className="platform-copy">
              <p>{dashboardText.introEyebrow}</p>
              <h1 className="platform-title">{dashboardText.introTitle}</h1>
              <span>{dashboardText.introBody}</span>
            </div>
            <div className="platform-metrics">
              {overviewStats.map((item) => (
                <article key={item.label} className="platform-metric-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <div className="platform-layout">
            <aside className="control-rail">
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
              <div className="quick-action-card">
                <div className="card-heading compact-heading">
                  <h2>{dashboardText.searchTitle}</h2>
                  <p>{dashboardText.searchBody}</p>
                </div>
                <div className="button-row button-row-stack">
                  <button className="primary-action" onClick={addCurrentCandidate} disabled={!report}>{dashboardText.actions.addCandidate}</button>
                  <button className="secondary-action" onClick={clearSelection}>{dashboardText.actions.clearSelection}</button>
                  <button className="secondary-action" onClick={() => setActivePage("guide")}>{dashboardText.actions.guide}</button>
                </div>
              </div>
              <section className="control-card">
                <div className="card-heading">
                  <h2>{dashboardText.compareTitle}</h2>
                  <p>{dashboardText.compareBody}</p>
                </div>
                <ComparisonTable
                  candidates={candidates}
                  text={dashboardText.comparison}
                  locale={locale}
                  onFocus={focusCandidate}
                  onRemove={removeCandidate}
                />
              </section>
              <section className="control-card">
                <div className="card-heading">
                  <h2>{dashboardText.layersTitle}</h2>
                  <p>{dashboardText.layersBody}</p>
                </div>
                <LayerToggle layers={layers} setLayers={setLayers} text={text} locale={locale} grouped />
              </section>
            </aside>

            <section className="map-column">
              <MapView
                selectedLocation={selectedLocation}
                selectedArea={selectedArea}
                report={report}
                radius={radius}
                layers={layers}
                onSelect={selectMapPoint}
                text={text}
                locale={locale}
                candidates={candidates}
              />
            </section>

            <aside className="analysis-rail">
              <section className="analysis-intro-card">
                <div className="card-heading">
                  <h2>{dashboardText.analysisTitle}</h2>
                  <p>{dashboardText.analysisBody}</p>
                </div>
              </section>
              {loading ? <div className="status">{text.status.loading}</div> : null}
              <LocationSummary report={report} selectedLocation={selectedLocation} text={text} locale={locale} />
              <ReportTabs report={report} text={text} locale={locale} />
              <ExportShare report={report} text={text} />
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
