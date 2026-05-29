export default function ExportShare({ report, text }) {
  const disabled = !report;

  function summaryText() {
    if (!report) return "";
    return [
      text.export.reportTitle,
      `${text.export.location}: ${report.location.address || `${report.location.lat}, ${report.location.lon}`}`,
      `${text.export.suburbLga}: ${report.location.suburb || text.summary.approximate} / ${report.location.lga || text.summary.approximate}`,
      `${text.export.overall}: ${report.scores.overall_score}/100`,
      `${text.export.nearestTrain}: ${report.transport.nearest_train?.name || text.common.notAvailable}`,
      `${text.export.nearestTram}: ${report.transport.nearest_tram?.name || text.common.notAvailable}`,
      `${text.export.nearestBus}: ${report.transport.nearest_bus?.name || text.common.notAvailable}`
    ].join("\n");
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summaryText());
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "victoria-location-report.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="export-panel">
      <h2>{text.export.title}</h2>
      <div className="button-row">
        <button disabled={disabled} onClick={copySummary}>{text.export.copy}</button>
        <button disabled={disabled} onClick={downloadJson}>{text.export.download}</button>
      </div>
    </section>
  );
}
