import { useEffect } from "react";
import { Circle, CircleMarker, GeoJSON, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { metres } from "../utils/formatters.js";
import { categoryLabel } from "../content.js";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function candidateIcon(index) {
  return L.divIcon({
    className: "candidate-pin-shell",
    html: `<div class="candidate-pin">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

const COLOURS = {
  metro_train: "#1d4ed8",
  regional_train: "#7c3aed",
  other_train: "#1d4ed8",
  metro_tram: "#16a34a",
  myki_bus: "#f59e0b",
  regional_bus: "#f59e0b",
  regional_coach: "#f59e0b",
  skybus: "#dc2626",
  other_bus: "#f59e0b",
  train: "#1d4ed8",
  tram: "#16a34a",
  bus: "#f59e0b",
  school: "#ec4899",
  health: "#dc2626",
  retail: "#0f766e",
  sport: "#16a34a"
};

function transportColour(item) {
  return COLOURS[item.transport_kind] || COLOURS[item.category] || "#475569";
}

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({ lat: event.latlng.lat, lon: event.latlng.lng, source: "map" });
    }
  });
  return null;
}

function Recenter({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function ClosePopupWhenFeatureClears({ selectedFeature }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedFeature) {
      map.closePopup();
    }
  }, [map, selectedFeature]);
  return null;
}

function featureVisible(feature, layers) {
  if (["train", "tram", "bus"].includes(feature.category)) return layers[`${feature.transport_kind || feature.category}_stops`];
  if (feature.category === "school") return layers.schools;
  if (feature.category === "health") return layers.health;
  if (feature.category === "retail") return layers.retail;
  if (feature.category === "sport") return layers.parks_sport;
  return false;
}

function stopMapClick(event) {
  if (event.originalEvent) {
    L.DomEvent.stop(event.originalEvent);
  }
}

export default function MapView({
  selectedLocation,
  selectedArea,
  selectedFeature,
  report,
  radius,
  layers,
  selectedRouteIds = [],
  routeDetails = { lines: [], stops: [] },
  onSelect,
  onFeatureSelect,
  text,
  locale,
  candidates = []
}) {
  const center = selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : [-37.8136, 144.9631];
  const features = report
    ? [
        ...report.map_features.transport,
        ...report.map_features.schools,
        ...report.map_features.health,
        ...report.map_features.retail,
        ...report.map_features.parks_sport
      ]
    : [];
  const routeLines = report?.map_features?.lines || [];
  const selectedRoutesActive = selectedRouteIds.length > 0;
  const displayRouteLines = selectedRoutesActive ? routeDetails.lines || [] : routeLines;
  const routeStopFeatures = selectedRoutesActive ? routeDetails.stops || [] : [];
  const pointFeatures = selectedRoutesActive
    ? [...routeStopFeatures, ...features.filter((feature) => !["train", "tram", "bus"].includes(feature.category))]
    : features;

  return (
    <section className="map-shell">
      <MapContainer center={center} zoom={selectedLocation ? 14 : 12} className="map" scrollWheelZoom>
        <Recenter center={center} />
        <ClosePopupWhenFeatureClears selectedFeature={selectedFeature} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        {selectedArea?.geojson ? (
          <GeoJSON
            data={selectedArea.geojson}
            interactive={false}
            style={{
              color: "#0f172a",
              weight: 2,
              fillColor: "#60a5fa",
              fillOpacity: 0.12
            }}
          />
        ) : null}
        {selectedLocation ? (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={markerIcon} interactive={false} zIndexOffset={-1000}>
              <Popup>{text.map.selectedLocation}</Popup>
            </Marker>
            {[400, 800, 2000].map((buffer) => (
              <Circle
                key={buffer}
                center={[selectedLocation.lat, selectedLocation.lon]}
                radius={buffer}
                interactive={false}
                pathOptions={{
                  color: buffer === radius ? "#111827" : "#64748b",
                  fillOpacity: buffer === radius ? 0.06 : 0.025,
                  weight: buffer === radius ? 2 : 1
                }}
              />
            ))}
          </>
        ) : null}
        {candidates
          .filter(
            (candidate) =>
              !selectedLocation ||
              candidate.location.lat !== selectedLocation.lat ||
              candidate.location.lon !== selectedLocation.lon
          )
          .map((candidate, index) => (
            <Marker key={candidate.id} position={[candidate.location.lat, candidate.location.lon]} icon={candidateIcon(index)}>
              <Popup>{candidate.label}</Popup>
            </Marker>
          ))}
        {displayRouteLines.filter((line) => layers[`${line.transport_kind || line.category}_lines`]).map((line) => (
          <Polyline
            key={line.id}
            bubblingMouseEvents={false}
            positions={line.coordinates.map(([lon, lat]) => [lat, lon])}
            pathOptions={{
              color: transportColour(line),
              opacity: 0.72,
              weight: 2
            }}
            eventHandlers={{
              click: stopMapClick
            }}
          >
            <Popup>
              <strong>{line.name}</strong>
              <br />
              {line.mode_label || categoryLabel(line.category, locale)}
              {line.route ? (
                <>
                  <br />
                  Route: {line.route}
                </>
              ) : null}
              {line.headsign ? (
                <>
                  <br />
                  Headsign: {line.headsign}
                </>
              ) : null}
              <br />
              {metres(line.distance_m, locale)}
            </Popup>
          </Polyline>
        ))}
        {pointFeatures.filter((feature) => featureVisible(feature, layers)).map((feature) => (
          <CircleMarker
            key={feature.id}
            bubblingMouseEvents={false}
            center={[feature.lat, feature.lon]}
            radius={selectedFeature?.id === feature.id ? 8 : ["train", "tram", "bus"].includes(feature.category) ? 5 : 6}
            pathOptions={{
              color: selectedFeature?.id === feature.id ? "#111827" : transportColour(feature),
              fillColor: transportColour(feature),
              fillOpacity: 1,
              weight: selectedFeature?.id === feature.id ? 3 : 1
            }}
            eventHandlers={{
              click: (event) => {
                stopMapClick(event);
                onFeatureSelect?.(feature);
              }
            }}
          >
            <Popup>
              <strong>{feature.name}</strong>
              <br />
              {feature.mode_label || categoryLabel(feature.category, locale)}
              {feature.stop_id ? (
                <>
                  <br />
                  Stop ID: {feature.stop_id}
                </>
              ) : null}
              <br />
              {metres(feature.distance_m, locale)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </section>
  );
}
