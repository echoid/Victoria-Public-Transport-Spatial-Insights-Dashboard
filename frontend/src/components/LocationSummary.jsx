import { metres, score } from "../utils/formatters.js";

function SummaryCard({ label, value, sub }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </article>
  );
}

export default function LocationSummary({ report, selectedLocation, text, locale }) {
  const transport = report?.transport;
  const nearbyFeatureCount = [
    report?.map_features?.transport?.length || 0,
    report?.map_features?.schools?.length || 0,
    report?.map_features?.health?.length || 0,
    report?.map_features?.retail?.length || 0,
    report?.map_features?.parks_sport?.length || 0
  ].reduce((sum, value) => sum + value, 0);

  return (
    <section>
      <div className="section-title">
        <h2>{text.summary.title}</h2>
      </div>
      <div className="summary-grid">
        <SummaryCard
          label={text.summary.overall}
          value={score(report?.scores?.overall_score)}
          sub={text.summary.currentReport}
        />
        <SummaryCard
          label={text.summary.transportScore}
          value={score(report?.scores?.transport_score)}
          sub={metres(transport?.nearest_train?.distance_m, locale)}
        />
        <SummaryCard
          label={text.summary.amenityScore}
          value={score(report?.scores?.amenity_score)}
          sub={text.summary.amenityContext}
        />
        <SummaryCard
          label={text.summary.planningScore}
          value={score(report?.scores?.planning_context_score)}
          sub={text.summary.planningContext}
        />
        <SummaryCard
          label={text.summary.nearbyFeatures}
          value={String(nearbyFeatureCount)}
          sub={text.summary.withinRadius}
        />
      </div>
    </section>
  );
}
