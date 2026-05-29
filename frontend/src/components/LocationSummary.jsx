import { coords, metres, score } from "../utils/formatters.js";

function SummaryCard({ label, value, sub }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </article>
  );
}

export default function LocationSummary({ report, selectedLocation }) {
  const location = report?.location || selectedLocation;
  const transport = report?.transport;
  return (
    <section>
      <div className="section-title">
        <h2>Location Summary</h2>
      </div>
      <div className="summary-grid">
        <SummaryCard label="Selected location" value={coords(location)} sub={report?.location?.address} />
        <SummaryCard label="Suburb" value={report?.location?.suburb || "Approximate"} sub={report?.location?.lga} />
        <SummaryCard
          label="Nearest train station"
          value={transport?.nearest_train?.name || "Not available"}
          sub={metres(transport?.nearest_train?.distance_m)}
        />
        <SummaryCard
          label="Nearest tram stop"
          value={transport?.nearest_tram?.name || "Not available"}
          sub={metres(transport?.nearest_tram?.distance_m)}
        />
        <SummaryCard
          label="Nearest bus stop"
          value={transport?.nearest_bus?.name || "Not available"}
          sub={metres(transport?.nearest_bus?.distance_m)}
        />
        <SummaryCard label="Overall suitability score" value={score(report?.scores?.overall_score)} sub="Transparent MVP score" />
      </div>
    </section>
  );
}
