export default function ExportShare({ report }) {
  const disabled = !report;

  function summaryText() {
    if (!report) return "";
    return [
      `Victoria Location Intelligence Report`,
      `Location: ${report.location.address || `${report.location.lat}, ${report.location.lon}`}`,
      `Suburb/LGA: ${report.location.suburb || "Approximate"} / ${report.location.lga || "Approximate"}`,
      `Overall score: ${report.scores.overall_score}/100`,
      `Nearest train: ${report.transport.nearest_train?.name || "Not available"}`,
      `Nearest tram: ${report.transport.nearest_tram?.name || "Not available"}`,
      `Nearest bus: ${report.transport.nearest_bus?.name || "Not available"}`
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
      <h2>Export / Share</h2>
      <div className="button-row">
        <button disabled={disabled} onClick={copySummary}>Copy summary text</button>
        <button disabled={disabled} onClick={downloadJson}>Download JSON report</button>
      </div>
    </section>
  );
}
