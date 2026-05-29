const OPTIONS = [
  ["train", "Train stations"],
  ["tram", "Tram stops"],
  ["bus", "Bus stops"],
  ["schools", "Schools"],
  ["health", "Health"],
  ["retail", "Retail / supermarkets"],
  ["parks_sport", "Parks / sport"],
  ["planning", "Planning zones / overlays"]
];

export default function LayerToggle({ layers, setLayers }) {
  return (
    <div className="layer-toggle" aria-label="Map layers">
      {OPTIONS.map(([key, label]) => (
        <label key={key} className="check-row">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
