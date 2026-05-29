export function metres(value) {
  if (value === null || value === undefined) return "Not available";
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(1)} km`;
}

export function score(value) {
  if (value === null || value === undefined) return "-";
  return `${Math.round(value)}/100`;
}

export function coords(location) {
  if (!location) return "No location selected";
  return `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`;
}
