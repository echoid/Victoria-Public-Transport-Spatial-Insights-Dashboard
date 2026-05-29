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
  return (
    <section>
      <div className="section-title">
        <h2>{text.summary.title}</h2>
      </div>
      <div className="summary-grid">
        <SummaryCard label={text.summary.suburb} value={report?.location?.suburb || text.summary.approximate} sub={report?.location?.lga} />
        <SummaryCard
          label={text.summary.nearestTrain}
          value={transport?.nearest_train?.name || text.common.notAvailable}
          sub={metres(transport?.nearest_train?.distance_m, locale)}
        />
        <SummaryCard
          label={text.summary.nearestTram}
          value={transport?.nearest_tram?.name || text.common.notAvailable}
          sub={metres(transport?.nearest_tram?.distance_m, locale)}
        />
        <SummaryCard
          label={text.summary.nearestBus}
          value={transport?.nearest_bus?.name || text.common.notAvailable}
          sub={metres(transport?.nearest_bus?.distance_m, locale)}
        />
        <SummaryCard label={text.summary.overall} value={score(report?.scores?.overall_score)} sub={text.summary.transparentScore} />
      </div>
    </section>
  );
}
