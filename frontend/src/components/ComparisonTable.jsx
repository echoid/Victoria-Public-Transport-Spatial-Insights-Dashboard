import { score } from "../utils/formatters.js";

function commuteValue(candidate) {
  const value = candidate.report?.commute?.commute_score;
  if (value === null || value === undefined) return "-";
  return score(value);
}

export default function ComparisonTable({ candidates, text, onFocus, onRemove }) {
  if (!candidates.length) {
    return <p className="comparison-empty">{text.empty}</p>;
  }

  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>{text.columns.location}</th>
            <th>{text.columns.suburb}</th>
            <th>{text.columns.overall}</th>
            <th>{text.columns.transport}</th>
            <th>{text.columns.amenities}</th>
            <th>{text.columns.commute}</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td>
                <strong>{candidate.label}</strong>
              </td>
              <td>{candidate.suburb}</td>
              <td>{score(candidate.report?.scores?.overall_score)}</td>
              <td>{score(candidate.report?.scores?.transport_score)}</td>
              <td>{score(candidate.report?.scores?.amenity_score)}</td>
              <td>{commuteValue(candidate)}</td>
              <td>
                <div className="comparison-actions">
                  <button onClick={() => onFocus(candidate)}>{text.focus}</button>
                  <button onClick={() => onRemove(candidate.id)}>{text.remove}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
