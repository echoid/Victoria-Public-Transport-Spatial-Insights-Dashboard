import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import LayerToggle from "./LayerToggle.jsx";
import { metres } from "../utils/formatters.js";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const COLOURS = {
  train: "#1d4e89",
  tram: "#7c3aed",
  bus: "#d1495b",
  school: "#f59e0b",
  health: "#dc2626",
  retail: "#0f766e",
  sport: "#16a34a"
};

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

function featureVisible(feature, layers) {
  if (["train", "tram", "bus"].includes(feature.category)) return layers[feature.category];
  if (feature.category === "school") return layers.schools;
  if (feature.category === "health") return layers.health;
  if (feature.category === "retail") return layers.retail;
  if (feature.category === "sport") return layers.parks_sport;
  return false;
}

export default function MapView({ selectedLocation, report, radius, layers, setLayers, onSelect }) {
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

  return (
    <section className="map-shell">
      <div className="map-toolbar">
        <div>
          <h2>Search + Map</h2>
          <p>Click the map or search for a Victorian place.</p>
        </div>
        <LayerToggle layers={layers} setLayers={setLayers} />
      </div>
      <MapContainer center={center} zoom={selectedLocation ? 14 : 12} className="map" scrollWheelZoom>
        <Recenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        {selectedLocation ? (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={markerIcon}>
              <Popup>Selected location</Popup>
            </Marker>
            {[400, 800, 2000].map((buffer) => (
              <Circle
                key={buffer}
                center={[selectedLocation.lat, selectedLocation.lon]}
                radius={buffer}
                pathOptions={{
                  color: buffer === radius ? "#111827" : "#64748b",
                  fillOpacity: buffer === radius ? 0.06 : 0.025,
                  weight: buffer === radius ? 2 : 1
                }}
              />
            ))}
          </>
        ) : null}
        {features.filter((feature) => featureVisible(feature, layers)).map((feature) => (
          <CircleMarker
            key={feature.id}
            center={[feature.lat, feature.lon]}
            radius={feature.category === "bus" ? 4 : 6}
            pathOptions={{
              color: COLOURS[feature.category] || "#475569",
              fillColor: COLOURS[feature.category] || "#475569",
              fillOpacity: 0.85,
              weight: 1
            }}
          >
            <Popup>
              <strong>{feature.name}</strong>
              <br />
              {feature.category}
              <br />
              {metres(feature.distance_m)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </section>
  );
}
