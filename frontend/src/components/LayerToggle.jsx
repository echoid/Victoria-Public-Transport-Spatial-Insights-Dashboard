import CategoryIcon from "./CategoryIcon.jsx";

const OPTIONS = [
  ["train", "train"],
  ["tram", "tram"],
  ["bus", "bus"],
  ["schools", "schools"],
  ["health", "health"],
  ["retail", "retail"],
  ["parks_sport", "parks_sport"],
  ["planning", "planning"]
];

export default function LayerToggle({ layers, setLayers, text }) {
  return (
    <div className="layer-toggle" aria-label={text.map.layers}>
      {OPTIONS.map(([key, labelKey]) => (
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
