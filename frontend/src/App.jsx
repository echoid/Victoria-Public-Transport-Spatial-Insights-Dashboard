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

const LANDING_COPY = {
  en: {
    brand: "Location Intelligence",
    brandSub: "Victoria home-search prototype",
    heroEyebrow: "A calmer, clearer way to compare locations.",
    heroTitle: "Choose where to live, with data.",
    heroSubtitle:
      "Compare transport access, nearby amenities, and everyday commute context across Victorian locations in one spatial dashboard.",
    actions: {
      demo: "Explore demo",
      method: "How it works"
    },
    spotlightEyebrow: "Current demo match",
    spotlightBody:
      "A map-first workspace for shortlisting one location at a time before inspections, trade-offs, and final decisions.",
    featureCards: [
      {
        title: "Transport, simplified.",
        body: "See nearby train, tram, and bus access without opening five different tools."
      },
      {
        title: "Amenities at a glance.",
        body: "Compare schools, health services, retail anchors, and open-space context around each point."
      },
      {
        title: "Commute that fits real life.",
        body: "Keep suburb, LGA, and personal distance context together so decisions stay grounded."
      }
    ],
    metrics: {
      location: "Current location",
      score: "Overall score",
      train: "Nearest train",
      commute: "Area travel time"
    },
    workspaceEyebrow: "Live workspace",
    workspaceTitle: "Interactive map, report, and shortlist context.",
    workspaceDescription:
      "Search by suburb, postcode, or landmark. Then inspect transport, amenities, profile, commute, and scoring in one progressive workflow.",
    calloutEyebrow: "Built on open spatial data.",
    calloutTitle: "Method, sources, and current limitations stay visible.",
    calloutBody:
      "The presentation is lighter, but the project remains explicit about how the score works, where data comes from, and what the static MVP still does not cover.",
    calloutAction: "Open project guide"
  },
  zh: {
    brand: "地点智能",
    brandSub: "维州买房选址原型",
    heroEyebrow: "更清晰、更克制地比较不同地点。",
    heroTitle: "用数据，决定住在哪里。",
    heroSubtitle:
      "把交通、周边配套，以及与你日常生活相关的通勤背景，放到同一个维州空间分析界面里比较。",
    actions: {
      demo: "体验 demo",
      method: "查看方法"
    },
    spotlightEyebrow: "当前示例地点",
    spotlightBody:
      "这是一个以地图为核心的买房选址工作台，适合在看房前先做候选地点筛选、比较和取舍。",
    featureCards: [
      {
        title: "交通，一眼看清。",
        body: "不用切换多个网站，就能先看火车、电车和公交可达性。"
      },
      {
        title: "配套，快速比较。",
        body: "把学校、医疗、零售锚点和开放空间放到同一视角里判断。"
      },
      {
        title: "通勤，更贴近日常。",
        body: "把 suburb、LGA 和与你有关的距离背景放在一起，减少只看印象的判断。"
      }
    ],
    metrics: {
      location: "当前地点",
      score: "综合分数",
      train: "最近火车站",
      commute: "区域到墨尔本时间"
    },
    workspaceEyebrow: "交互工作台",
    workspaceTitle: "在一个界面里完成地图、报告与候选地点比较。",
    workspaceDescription:
      "可以直接搜索 suburb、postcode 或 landmark，再继续看交通、配套、区域画像、通勤和评分。",
    calloutEyebrow: "基于公开空间数据。",
    calloutTitle: "方法、来源和当前限制仍然保持透明。",
    calloutBody:
      "页面风格更像产品发布页，但这个项目依然明确说明评分逻辑、数据来源，以及静态 MVP 目前尚未覆盖的部分。",
    calloutAction: "打开项目说明"
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
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const searchRequestRef = useRef(0);
  const areaRequestRef = useRef(0);
  const workspaceRef = useRef(null);
  const text = getText(locale);
  const landing = LANDING_COPY[locale] || LANDING_COPY.en;

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

  const spotlightStats = [
    {
      label: landing.metrics.location,
      value: report?.location?.suburb || selectedArea?.label || DEFAULT_LOCATION.label
    },
    {
      label: landing.metrics.score,
      value: score(report?.scores?.overall_score)
    },
    {
      label: landing.metrics.train,
      value: metres(report?.transport?.nearest_train?.distance_m, locale)
    },
    {
      label: landing.metrics.commute,
      value:
        report?.commute?.lga_travel_time_to_melbourne_min !== null && report?.commute?.lga_travel_time_to_melbourne_min !== undefined
          ? `${Math.round(report.commute.lga_travel_time_to_melbourne_min)} min`
          : locale === "zh"
            ? "暂无数据"
            : "Not available"
    }
  ];

  function scrollToWorkspace() {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <header className="app-header">
        <div className="brand-lockup">
          <p>{landing.brand}</p>
          <span>{landing.brandSub}</span>
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
            {activePage === "dashboard" ? (
              <button className="primary-action top-action" onClick={scrollToWorkspace}>{landing.actions.demo}</button>
            ) : null}
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
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="hero-eyebrow">{landing.heroEyebrow}</p>
              <h1 className="hero-title">{landing.heroTitle}</h1>
              <p className="hero-subtitle">{landing.heroSubtitle}</p>
              <div className="hero-actions">
                <button className="primary-action" onClick={scrollToWorkspace}>{landing.actions.demo}</button>
                <button className="secondary-action" onClick={() => setActivePage("guide")}>{landing.actions.method}</button>
              </div>
            </div>
            <div className="hero-spotlight">
              <p className="spotlight-eyebrow">{landing.spotlightEyebrow}</p>
              <h2>{report?.location?.suburb || selectedArea?.label || DEFAULT_LOCATION.label}</h2>
              <span>{report?.location?.address || selectedLocation?.label || DEFAULT_LOCATION.label}</span>
              <p>{landing.spotlightBody}</p>
              <div className="spotlight-grid">
                {spotlightStats.map((item) => (
                  <article key={item.label} className="spotlight-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="feature-section">
            {landing.featureCards.map((item) => (
              <article key={item.title} className="feature-story-card">
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </section>

          <section className="workspace-section" ref={workspaceRef}>
            <div className="workspace-heading">
              <p>{landing.workspaceEyebrow}</p>
              <h2>{landing.workspaceTitle}</h2>
              <span>{landing.workspaceDescription}</span>
            </div>
            <div className="dashboard dashboard-surface">
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
          </section>

          <section className="callout-panel">
            <div>
              <p>{landing.calloutEyebrow}</p>
              <h2>{landing.calloutTitle}</h2>
              <span>{landing.calloutBody}</span>
            </div>
            <button className="secondary-action" onClick={() => setActivePage("guide")}>{landing.calloutAction}</button>
          </section>
        </>
      )}
    </main>
  );
}
