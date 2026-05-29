import CategoryIcon from "./CategoryIcon.jsx";

const GROUPS = [
  {
    key: "transport",
    items: [
      ["train_stops", "trainStops", "train"],
      ["train_lines", "trainLines", "train"],
      ["tram_stops", "tramStops", "tram"],
      ["tram_lines", "tramLines", "tram"],
      ["bus_stops", "busStops", "bus"],
      ["bus_lines", "busLines", "bus"]
    ]
  },
  {
    key: "amenities",
    items: [["schools", "schools"], ["health", "health"], ["retail", "retail"], ["parks_sport", "parks_sport"]]
  },
  {
    key: "planning",
    items: [["planning", "planning"]]
  }
];

const GROUP_LABELS = {
  en: {
    transport: "Transport",
    amenities: "Amenities",
    planning: "Planning"
  },
  zh: {
    transport: "交通",
    amenities: "配套",
    planning: "规划"
  }
};

function routeModeLabel(category, locale) {
  const labels = {
    en: { train: "Train", tram: "Tram", bus: "Bus" },
    zh: { train: "火车", tram: "电车", bus: "公交" }
  };
  return (labels[locale] || labels.en)[category] || category;
}

export default function LayerToggle({
  layers,
  setLayers,
  text,
  locale = "en",
  grouped = false,
  routeOptions = [],
  selectedRouteIds = [],
  setSelectedRouteIds
}) {
  const labels = GROUP_LABELS[locale] || GROUP_LABELS.en;
  const selectedRoutes = new Set(selectedRouteIds);

  function toggleRoute(routeId, checked) {
    if (!setSelectedRouteIds) return;
    setSelectedRouteIds((current) => {
      const next = new Set(current);
      if (checked) next.add(routeId);
      else next.delete(routeId);
      return [...next];
    });
  }

  if (grouped) {
    return (
      <div className="layer-groups" aria-label={text.map.layers}>
        {GROUPS.map((group) => (
          <section key={group.key} className="layer-group">
            <h3>{labels[group.key]}</h3>
            <div className="layer-toggle layer-toggle-grouped">
              {group.items.map(([key, labelKey, iconKey = key]) => (
                <label key={key} className="check-row check-row-card">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  <span className="label-with-icon">
                    <CategoryIcon category={iconKey} label={text.layers[labelKey]} />
                    <span>{text.layers[labelKey]}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="layer-toggle" aria-label={text.map.layers}>
      {GROUPS.flatMap((group) => group.items).map(([key, labelKey, iconKey = key]) => (
        <label key={key} className="check-row">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))}
          />
          <span className="label-with-icon">
            <CategoryIcon category={iconKey} label={text.layers[labelKey]} />
            <span>{text.layers[labelKey]}</span>
          </span>
        </label>
      ))}
      <details className="route-selector">
        <summary>
          <span>{locale === "zh" ? "线路筛选" : "Routes"}</span>
          <strong>{selectedRouteIds.length || (locale === "zh" ? "全部" : "All")}</strong>
        </summary>
        <div className="route-selector-panel">
          <div className="route-selector-actions">
            <button type="button" onClick={() => setSelectedRouteIds?.([])}>
              {locale === "zh" ? "清除" : "Clear"}
            </button>
          </div>
          {routeOptions.length ? (
            routeOptions.map((route) => (
              <label key={route.id} className="route-option">
                <input
                  type="checkbox"
                  checked={selectedRoutes.has(route.id)}
                  onChange={(event) => toggleRoute(route.id, event.target.checked)}
                />
                <span>
                  <strong>{route.label}</strong>
                  <small>
                    {routeModeLabel(route.category, locale)}
                    {route.route ? ` / ${route.route}` : ""}
                    {route.line_count ? ` / ${route.line_count} ${locale === "zh" ? "线段" : "segments"}` : ""}
                  </small>
                </span>
              </label>
            ))
          ) : (
            <p>{locale === "zh" ? "选择地点后显示附近线路。" : "Select a location to list nearby routes."}</p>
          )}
        </div>
      </details>
    </div>
  );
}
