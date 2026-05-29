export function metres(value, locale = "en") {
  if (value === null || value === undefined) return locale === "zh" ? "暂无数据" : "Not available";
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(1)} km`;
}

export function score(value) {
  if (value === null || value === undefined) return "-";
  return `${Math.round(value)}/100`;
}

export function coords(location, locale = "en") {
  if (!location) return locale === "zh" ? "尚未选择地点" : "No location selected";
  return `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`;
}
