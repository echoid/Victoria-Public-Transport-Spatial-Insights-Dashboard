import { useState } from "react";
import { metres, score } from "../utils/formatters.js";
import { categoryLabel, translatePlanningNote, translatePlanningZone, translateReason } from "../content.js";

const TABS = ["transport", "amenities", "profile", "commute", "planning", "score", "method"];

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined) return "-";
  return Number(value).toFixed(digits);
}

function CountTable({ rows, text }) {
  return (
    <table>
      <thead>
        <tr>
          <th>{text.report.table.category}</th>
          <th>400m</th>
          <th>800m</th>
          <th>2km</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function FeatureList({ items, locale }) {
  return (
    <div className="feature-list">
      {items.map((item) => (
        <div key={item.id}>
          <strong>{item.name}</strong>
          <span>
            {categoryLabel(item.category, locale)} · {metres(item.distance_m, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReportTabs({ report, text, locale }) {
  const [active, setActive] = useState("transport");
  const scoringFramework = text.guide?.home?.scoring;

  if (!report) {
    return (
      <section className="empty-report">
        <h2>{text.report.title}</h2>
        <p>{text.report.empty}</p>
      </section>
    );
  }

  const transportRows = [["train", text.report.categories.train], ["tram", text.report.categories.tram], ["bus", text.report.categories.bus]].map(([category, label]) => (
    <tr key={category}>
      <td>{label}</td>
      <td>{report.transport.counts.within_400m[category]}</td>
      <td>{report.transport.counts.within_800m[category]}</td>
      <td>{report.transport.counts.within_2000m[category]}</td>
    </tr>
  ));

  const amenityRows = [
    ["schools", text.report.categories.schools],
    ["health", text.report.categories.health],
    ["retail", text.report.categories.retail],
    ["parks_sport", text.report.categories.parks_sport]
  ].map(([key, label]) => (
    <tr key={key}>
      <td>{label}</td>
      <td>{report.amenities.counts[key].within_400m}</td>
      <td>{report.amenities.counts[key].within_800m}</td>
      <td>{report.amenities.counts[key].within_2000m}</td>
    </tr>
  ));

  const profileRows = report.profile
    ? [
        [text.report.profile.reference, report.profile.reference_property_id || "-"],
        [text.report.profile.suburb, report.profile.suburb || "-"],
        [text.report.profile.lga, report.profile.lga || "-"],
        [
          text.report.profile.referenceDistance,
          report.profile.reference_distance_km !== null && report.profile.reference_distance_km !== undefined
            ? `${formatNumber(report.profile.reference_distance_km, 2)} km`
            : "-"
        ],
        [
          text.report.profile.lgaDistance,
          report.profile.lga_distance_to_melbourne_km !== null && report.profile.lga_distance_to_melbourne_km !== undefined
            ? `${formatNumber(report.profile.lga_distance_to_melbourne_km, 1)} km`
            : "-"
        ],
        [
          text.report.profile.lgaTravelTime,
          report.profile.lga_travel_time_to_melbourne_min !== null && report.profile.lga_travel_time_to_melbourne_min !== undefined
            ? `${Math.round(report.profile.lga_travel_time_to_melbourne_min)} min`
            : "-"
        ],
        [text.report.profile.gpAccess, report.profile.gps_per_1000_pop !== null && report.profile.gps_per_1000_pop !== undefined ? formatNumber(report.profile.gps_per_1000_pop, 1) : "-"],
        [text.report.profile.pharmacyAccess, report.profile.pharms_per_1000_pop !== null && report.profile.pharms_per_1000_pop !== undefined ? formatNumber(report.profile.pharms_per_1000_pop, 1) : "-"],
        [text.report.profile.schools5km, report.profile.schools_5km ?? "-"],
        [text.report.profile.health5km, report.profile.health_5km ?? "-"],
        [text.report.profile.sport2km, report.profile.sport_2km ?? "-"],
        [text.report.profile.retail2km, report.profile.retail_2km ?? "-"]
      ]
    : [];

  const scoreRows = [
    [text.report.categories.transport, report.scores.transport_score],
    [text.report.tabs.amenities, report.scores.amenity_score],
    [text.report.categories.planningContext, report.scores.planning_context_score],
    [text.report.categories.overall, report.scores.overall_score]
  ];

  const scoreReasons = [...report.scores.reasons.transport, ...report.scores.reasons.amenities, ...report.scores.reasons.planning];

  return (
    <section className="report">
      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button key={tab} className={active === tab ? "active" : ""} onClick={() => setActive(tab)}>
            {text.report.tabs[tab]}
          </button>
        ))}
      </div>

      {active === "transport" ? (
        <div className="tab-panel active">
          <CountTable rows={transportRows} text={text} />
          <FeatureList items={report.map_features.transport.slice(0, 8)} locale={locale} />
        </div>
      ) : null}

      {active === "amenities" ? (
        <div className="tab-panel active">
          <CountTable rows={amenityRows} text={text} />
          <FeatureList
            items={[
              ...report.map_features.schools.slice(0, 3),
              ...report.map_features.health.slice(0, 3),
              ...report.map_features.retail.slice(0, 3),
              ...report.map_features.parks_sport.slice(0, 3)
            ]}
            locale={locale}
          />
        </div>
      ) : null}

      {active === "profile" ? (
        <div className="tab-panel active">
          {report.profile ? (
            <>
              <div className="note-box">
                <strong>{text.report.profile.title}</strong>
                <p>{text.report.profile.note}</p>
              </div>
              <div className="detail-grid">
                {profileRows.map(([label, value]) => (
                  <div key={label} className="detail-card">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              {report.profile.notes ? <p className="guide-paragraph">{report.profile.notes}</p> : null}
            </>
          ) : (
            <div className="note-box">
              <strong>{text.report.profile.title}</strong>
              <p>{text.report.profile.empty}</p>
            </div>
          )}
        </div>
      ) : null}

      {active === "commute" ? (
        <div className="tab-panel active">
          {report.commute ? (
            <>
              <div className="detail-grid detail-grid-compact">
                <div className="detail-card">
                  <span>{text.report.commute.weightedDistance}</span>
                  <strong>
                    {report.commute.weighted_target_km !== null && report.commute.weighted_target_km !== undefined
                      ? `${formatNumber(report.commute.weighted_target_km, 2)} km`
                      : "-"}
                  </strong>
                </div>
                <div className="detail-card">
                  <span>{text.report.commute.score}</span>
                  <strong>{score(report.commute.commute_score)}</strong>
                </div>
                <div className="detail-card">
                  <span>{text.report.commute.lgaTravelTime}</span>
                  <strong>
                    {report.commute.lga_travel_time_to_melbourne_min !== null && report.commute.lga_travel_time_to_melbourne_min !== undefined
                      ? `${Math.round(report.commute.lga_travel_time_to_melbourne_min)} min`
                      : "-"}
                  </strong>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>{text.report.commute.destination}</th>
                    <th>{text.report.commute.distance}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.commute.target_distances.map((item) => (
                    <tr key={item.target}>
                      <td>{item.target}</td>
                      <td>{`${formatNumber(item.km, 2)} km`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="note-box">
                <strong>{text.report.commute.methodology}</strong>
                <p>{report.commute.methodology}</p>
              </div>
            </>
          ) : (
            <div className="note-box">
              <strong>{text.report.commute.title}</strong>
              <p>{text.report.commute.empty}</p>
            </div>
          )}
        </div>
      ) : null}

      {active === "planning" ? (
        <div className="tab-panel active">
          <div className="note-box">
            <strong>{translatePlanningZone(report.planning.zone, locale)}</strong>
            <p>{translatePlanningNote(report.planning.note, locale)}</p>
          </div>
        </div>
      ) : null}

      {active === "score" ? (
        <div className="tab-panel active">
          {scoringFramework ? (
            <>
              <div className="note-box">
                <strong>{scoringFramework.title}</strong>
                <p>{scoringFramework.intro}</p>
              </div>
              <div className="detail-grid detail-grid-compact">
                {scoreRows.map(([label, value]) => (
                  <div key={label} className="detail-card">
                    <span>{label}</span>
                    <strong>{score(value)}</strong>
                  </div>
                ))}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>{scoringFramework.dimensionLabel}</th>
                    <th>{scoringFramework.weightLabel}</th>
                    <th>{scoringFramework.criteriaLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {scoringFramework.criteria.map((item) => (
                    <tr key={item.dimension}>
                      <td>{item.dimension}</td>
                      <td>{item.weight}</td>
                      <td>{item.criteria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="reasons">
                {scoreReasons.map((reason) => (
                  <p key={reason}>{translateReason(reason, locale)}</p>
                ))}
              </div>
              <ul className="limitations">
                {scoringFramework.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : (
            <div className="score-bars">
              {scoreRows.map(([label, value]) => (
                <div key={label}>
                  <span>
                    {label} <strong>{score(value)}</strong>
                  </span>
                  <meter min="0" max="100" value={value} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {active === "method" ? (
        <div className="tab-panel active">
          <ul className="limitations">
            {text.report.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
