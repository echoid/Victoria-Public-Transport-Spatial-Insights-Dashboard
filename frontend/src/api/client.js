import { staticAreaBoundary, staticGeocode, staticLocationReport } from "./staticClient.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const STATIC_MVP = import.meta.env.VITE_STATIC_MVP === "true";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json();
}

export function geocode(query) {
  if (STATIC_MVP) return staticGeocode(query);
  return request(`/api/geocode?query=${encodeURIComponent(query)}`);
}

export function getAreaBoundary({ lat, lon }) {
  if (STATIC_MVP) return staticAreaBoundary({ lat, lon });
  const params = new URLSearchParams({ lat, lon });
  return request(`/api/area-boundary?${params.toString()}`);
}

export function getLocationReport({ lat, lon, radius }) {
  if (STATIC_MVP) return staticLocationReport({ lat, lon, radius });
  const params = new URLSearchParams({ lat, lon, radius });
  return request(`/api/location-report?${params.toString()}`);
}
