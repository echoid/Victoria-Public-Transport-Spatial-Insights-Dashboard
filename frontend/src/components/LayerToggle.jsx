import CategoryIcon from "./CategoryIcon.jsx";

const GROUPS = [
  {
    key: "transport",
    items: [["train", "train"], ["tram", "tram"], ["bus", "bus"]]
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

export default function LayerToggle({ layers, setLayers, text, locale = "en", grouped = false }) {
  const labels = GROUP_LABELS[locale] || GROUP_LABELS.en;

  if (grouped) {
    return (
      <div className="layer-groups" aria-label={text.map.layers}>
        {GROUPS.map((group) => (
          <section key={group.key} className="layer-group">
            <h3>{labels[group.key]}</h3>
            <div className="layer-toggle layer-toggle-grouped">
              {group.items.map(([key, labelKey]) => (
                <label key={key} className="check-row check-row-card">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  <span className="label-with-icon">
                    <CategoryIcon category={key} label={text.layers[labelKey]} />
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
      {GROUPS.flatMap((group) => group.items).map(([key, labelKey]) => (
        <label key={key} className="check-row">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))}
          />
          <span className="label-with-icon">
            <CategoryIcon category={key} label={text.layers[labelKey]} />
            <span>{text.layers[labelKey]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
