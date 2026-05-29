import { useState } from "react";
import { metres, score } from "../utils/formatters.js";

const TABS = ["Transport", "Amenities", "Planning", "Score", "Method / Limitations"];

function CountTable({ rows }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>400m</th>
          <th>800m</th>
          <th>2km</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function FeatureList({ items }) {
  return (
    <div className="feature-list">
      {items.map((item) => (
        <div key={item.id}>
          <strong>{item.name}</strong>
          <span>
            {item.category} · {metres(item.distance_m)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReportTabs({ report }) {
  const [active, setActive] = useState("Transport");

  if (!report) {
    return (
      <section className="empty-report">
        <h2>Report</h2>
        <p>Select a point on the map or search for a place to generate the first report.</p>
      </section>
    );
  }

  const transportRows = ["train", "tram", "bus"].map((category) => (
    <tr key={category}>
      <td>{category}</td>
      <td>{report.transport.counts.within_400m[category]}</td>
      <td>{report.transport.counts.within_800m[category]}</td>
      <td>{report.transport.counts.within_2000m[category]}</td>
    </tr>
  ));

  const amenityRows = [
    ["schools", "Schools"],
    ["health", "Health"],
    ["retail", "Retail"],
    ["parks_sport", "Parks / sport"]
  ].map(([key, label]) => (
    <tr key={key}>
      <td>{label}</td>
      <td>{report.amenities.counts[key].within_400m}</td>
      <td>{report.amenities.counts[key].within_800m}</td>
      <td>{report.amenities.counts[key].within_2000m}</td>
    </tr>
  ));

  return (
    <section className="report">
      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button key={tab} className={active === tab ? "active" : ""} onClick={() => setActive(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {active === "Transport" ? (
        <div className="tab-panel active">
          <CountTable rows={transportRows} />
          <FeatureList items={report.map_features.transport.slice(0, 8)} />
        </div>
      ) : null}

      {active === "Amenities" ? (
        <div className="tab-panel active">
          <CountTable rows={amenityRows} />
          <FeatureList
            items={[
              ...report.map_features.schools.slice(0, 3),
              ...report.map_features.health.slice(0, 3),
              ...report.map_features.retail.slice(0, 3),
              ...report.map_features.parks_sport.slice(0, 3)
            ]}
          />
        </div>
      ) : null}

      {active === "Planning" ? (
        <div className="tab-panel active">
          <div className="note-box">
            <strong>{report.planning.zone}</strong>
            <p>{report.planning.note}</p>
          </div>
        </div>
      ) : null}

      {active === "Score" ? (
        <div className="tab-panel active">
          <div className="score-bars">
            {[
              ["Transport", report.scores.transport_score],
              ["Amenities", report.scores.amenity_score],
              ["Planning context", report.scores.planning_context_score],
              ["Overall", report.scores.overall_score]
            ].map(([label, value]) => (
              <div key={label}>
                <span>
                  {label} <strong>{score(value)}</strong>
                </span>
                <meter min="0" max="100" value={value} />
              </div>
            ))}
          </div>
          <div className="reasons">
            {[...report.scores.reasons.transport, ...report.scores.reasons.amenities, ...report.scores.reasons.planning].map(
              (reason) => (
                <p key={reason}>{reason}</p>
              )
            )}
          </div>
        </div>
      ) : null}

      {active === "Method / Limitations" ? (
        <div className="tab-panel active">
          <ul className="limitations">
            <li>Distances are straight-line distances unless otherwise stated.</li>
            <li>The app does not provide legal, planning, property, or financial advice.</li>
            <li>OpenStreetMap and bundled public-data completeness varies by area.</li>
            <li>Nominatim is a public geocoding service with usage limits.</li>
            <li>Planning data should be checked against official Victorian Government planning tools.</li>
            <li>Property price, sale history, rental yield and live route planning are not included in the free MVP.</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
