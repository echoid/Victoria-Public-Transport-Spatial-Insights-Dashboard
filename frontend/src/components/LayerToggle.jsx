import CategoryIcon from "./CategoryIcon.jsx";

const STOP_GROUPS = [
  {
    key: "train",
    label: { en: "Train", zh: "火车" },
    icon: "train",
    items: [
      ["metro_train_stops", "Metropolitan Train", "大都会火车"],
      ["regional_train_stops", "Regional Train", "区域火车"],
      ["other_train_stops", "Other train", "其他火车"]
    ]
  },
  {
    key: "bus",
    label: { en: "Bus", zh: "公交" },
    icon: "bus",
    items: [
      ["myki_bus_stops", "Myki Bus", "Myki 公交"],
      ["regional_bus_stops", "Regional Bus", "区域公交"],
      ["regional_coach_stops", "Regional Coach", "区域长途巴士"],
      ["skybus_stops", "SkyBus", "SkyBus"],
      ["other_bus_stops", "Other bus", "其他公交"]
    ]
  },
  {
    key: "tram",
    label: { en: "Tram", zh: "电车" },
    icon: "tram",
    items: [["metro_tram_stops", "Metropolitan Tram", "大都会电车"]]
  }
];

const ROUTE_GROUPS = STOP_GROUPS.map((group) => ({
  ...group,
  items: group.items.map(([key, en, zh]) => [key.replace("_stops", "_lines"), en, zh])
}));

const AMENITY_ITEMS = [
  ["schools", "schools", "school"],
  ["health", "health", "health"],
  ["retail", "retail", "retail"],
  ["parks_sport", "parks_sport", "sport"],
  ["planning", "planning", "planning"]
];

function routeModeLabel(route, locale) {
  const fallback = {
    en: { train: "Train", tram: "Tram", bus: "Bus" },
    zh: { train: "火车", tram: "电车", bus: "公交" }
  };
  return route.mode_label || (fallback[locale] || fallback.en)[route.category] || route.category;
}

function toggleLayer(setLayers, key, checked) {
  setLayers((current) => ({ ...current, [key]: checked }));
}

function activeRouteKinds(layers) {
  return new Set(ROUTE_GROUPS.flatMap((group) => group.items.map(([key]) => key.replace("_lines", ""))).filter((kind) => layers[`${kind}_lines`]));
}

function TransportGroup({ title, groups, layers, setLayers, locale }) {
  return (
    <section className="transport-layer-section">
      <h3>{title}</h3>
      {groups.map((group) => (
        <div key={group.key} className="transport-mode-group">
          <div className="transport-mode-heading">
            <CategoryIcon category={group.icon} label={group.label[locale] || group.label.en} />
            <strong>{group.label[locale] || group.label.en}</strong>
          </div>
          <div className="transport-mode-options">
            {group.items.map(([key, en, zh]) => (
              <label key={key} className="transport-check-row">
                <input
                  type="checkbox"
                  checked={Boolean(layers[key])}
                  onChange={(event) => toggleLayer(setLayers, key, event.target.checked)}
                />
                <span>{locale === "zh" ? zh : en}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function LayerToggle({
  layers,
  setLayers,
  text,
  locale = "en",
  routeOptions = [],
  selectedRouteIds = [],
  setSelectedRouteIds
}) {
  const selectedRoutes = new Set(selectedRouteIds);
  const routeKinds = activeRouteKinds(layers);
  const filteredRouteOptions = routeOptions.filter((route) => routeKinds.has(route.transport_kind || route.category));

  function toggleRoute(routeId, checked) {
    if (!setSelectedRouteIds) return;
    setSelectedRouteIds((current) => {
      const next = new Set(current);
      if (checked) next.add(routeId);
      else next.delete(routeId);
      return [...next];
    });
  }

  return (
    <div className="layer-toggle" aria-label={text.map.layers}>
      <details className="transport-selector">
        <summary>
          <span>{locale === "zh" ? "交通" : "Transportation"}</span>
          <strong>{selectedRouteIds.length || (locale === "zh" ? "全部" : "All")}</strong>
        </summary>
        <div className="transport-selector-panel">
          <div className="transport-selector-grid">
            <TransportGroup
              title={locale === "zh" ? "站点" : "Stops"}
              groups={STOP_GROUPS}
              layers={layers}
              setLayers={setLayers}
              locale={locale}
            />
            <TransportGroup
              title={locale === "zh" ? "线路" : "Routes"}
              groups={ROUTE_GROUPS}
              layers={layers}
              setLayers={setLayers}
              locale={locale}
            />
          </div>

          <section className="transport-layer-section route-list-section">
            <div className="route-list-heading">
              <h3>{locale === "zh" ? "选择具体线路" : "Select Routes"}</h3>
              <button type="button" onClick={() => setSelectedRouteIds?.([])}>
                {locale === "zh" ? "清除" : "Clear"}
              </button>
            </div>
            <div className="route-option-list">
              {filteredRouteOptions.length ? (
                filteredRouteOptions.map((route) => (
                  <label key={route.id} className="route-option">
                    <input
                      type="checkbox"
                      checked={selectedRoutes.has(route.id)}
                      onChange={(event) => toggleRoute(route.id, event.target.checked)}
                    />
                    <span>
                      <strong>{route.label}</strong>
                      <small>
                        {routeModeLabel(route, locale)}
                        {route.route ? ` / ${route.route}` : ""}
                        {route.line_count ? ` / ${route.line_count} ${locale === "zh" ? "线段" : "segments"}` : ""}
                      </small>
                    </span>
                  </label>
                ))
              ) : (
                <p>{locale === "zh" ? "选择地点，并打开至少一个 route 分类。" : "Select a location and enable at least one route category."}</p>
              )}
            </div>
          </section>
        </div>
      </details>

      {AMENITY_ITEMS.map(([key, labelKey, iconKey]) => (
        <label key={key} className="check-row">
          <input
            type="checkbox"
            checked={Boolean(layers[key])}
            onChange={(event) => toggleLayer(setLayers, key, event.target.checked)}
          />
          <span className="label-with-icon">
            <CategoryIcon category={iconKey} label={text.layers[labelKey]} />
            <span>{text.layers[labelKey]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
