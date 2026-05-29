const DATA_URL = `${import.meta.env.BASE_URL}data/home_location_dashboard_data.json`;
const TRANSPORT = new Set(["train", "tram", "bus"]);
const AMENITY_GROUPS = {
  schools: new Set(["school"]),
  health: new Set(["health"]),
  retail: new Set(["retail"]),
  parks_sport: new Set(["sport"])
};
const RAW_AMENITIES = new Set(["school", "health", "retail", "sport"]);
const EARTH_RADIUS_KM = 6371.0088;

let dataPromise;

function cacheKey(prefix, value) {
  return `${prefix}:${String(value).trim().toLowerCase()}`;
}

async function loadData() {
  if (!dataPromise) {
    dataPromise = fetch(DATA_URL).then((response) => {
      if (!response.ok) {
        throw new Error("Static data file could not be loaded.");
      }
      return response.json();
    });
  }
  return dataPromise;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normaliseFeatures(payload) {
  return payload.features
    .filter((feature) => feature.lat !== undefined && feature.lon !== undefined)
    .map((feature, index) => ({
      id: `${feature.category || "feature"}-${index}`,
      name: feature.name || "Unnamed feature",
      category: feature.category || "unknown",
      lat: Number(feature.lat),
      lon: Number(feature.lon),
      routes: feature.routes || null,
      source: feature.source || null
    }));
}

function nearestPropertyContext(payload, lat, lon) {
  const nearest = payload.properties.reduce(
    (best, property) => {
      const distance = haversineKm(lat, lon, Number(property.lat), Number(property.lon));
      return distance < best.distance ? { property, distance } : best;
    },
    { property: null, distance: Infinity }
  );
  if (!nearest.property) return {};
  return {
    suburb: nearest.property.suburb,
    lga: nearest.property.lga,
    reference_location: nearest.property.address,
    reference_distance_km: Number(nearest.distance.toFixed(2))
  };
}

function featuresWithin(features, lat, lon, radiusM) {
  const radiusKm = radiusM / 1000;
  return features
    .map((feature) => ({
      ...feature,
      distance_m: Math.round(haversineKm(lat, lon, feature.lat, feature.lon) * 1000)
    }))
    .filter((feature) => feature.distance_m <= radiusKm * 1000)
    .sort((a, b) => a.distance_m - b.distance_m);
}

function nearestByCategory(features, lat, lon, categories) {
  let best = null;
  for (const feature of features) {
    if (!categories.has(feature.category)) continue;
    const distance_m = Math.round(haversineKm(lat, lon, feature.lat, feature.lon) * 1000);
    if (!best || distance_m < best.distance_m) {
      best = { ...feature, distance_m };
    }
  }
  return best;
}

function countsForCategories(features, categories, radii) {
  const result = {};
  for (const radius of radii) {
    const key = `within_${radius}m`;
    result[key] = {};
    for (const category of [...categories].sort()) {
      result[key][category] = features.filter(
        (feature) => feature.category === category && feature.distance_m <= radius
      ).length;
    }
  }
  return result;
}

function clamp(value, low = 0, high = 100) {
  return Math.max(low, Math.min(high, value));
}

function distancePoints(distanceM, bestM, outerM, weight) {
  if (distanceM === null || distanceM === undefined || distanceM > outerM) return 0;
  if (distanceM <= bestM) return weight;
  return weight * (1 - (distanceM - bestM) / (outerM - bestM));
}

function transportScore(nearest, counts800m) {
  let value = 0;
  const reasons = [];
  value += distancePoints(nearest.train?.distance_m, 400, 1600, 32);
  value += distancePoints(nearest.tram?.distance_m, 400, 1400, 24);
  value += distancePoints(nearest.bus?.distance_m, 250, 800, 20);
  const stops800m = Object.values(counts800m).reduce((sum, count) => sum + count, 0);
  value += Math.min(14, stops800m * 0.7);
  const modes = Object.values(counts800m).filter((count) => count > 0).length;
  value += modes * 3.3;

  if (nearest.train?.distance_m <= 800) reasons.push("Train access is within 800m.");
  if (nearest.tram?.distance_m <= 800) reasons.push("Tram access is within 800m.");
  if (nearest.bus?.distance_m <= 400) reasons.push("A bus stop is within 400m.");
  if (modes >= 2) reasons.push("Multiple public transport modes are available nearby.");
  if (!reasons.length) reasons.push("Nearby public transport is limited in the bundled static dataset.");
  return [Number(clamp(value).toFixed(1)), reasons];
}

function amenityScore(nearest, counts2km) {
  let value = 0;
  const reasons = [];
  value += Math.min(25, (counts2km.school || 0) * 1.3);
  value += Math.min(20, (counts2km.health || 0) * 5);
  value += Math.min(20, (counts2km.retail || 0) * 12);
  value += Math.min(20, (counts2km.sport || 0) * 0.8);
  value += distancePoints(nearest.retail?.distance_m, 600, 2000, 8);
  value += distancePoints(nearest.school?.distance_m, 800, 2000, 7);

  if (counts2km.school) reasons.push(`${counts2km.school} school features are within 2km.`);
  if (counts2km.health) reasons.push(`${counts2km.health} health service features are within 2km.`);
  if (counts2km.retail) reasons.push("Retail or supermarket anchors are represented nearby.");
  if (counts2km.sport) reasons.push(`${counts2km.sport} sport/open-space features are within 2km.`);
  if (!reasons.length) reasons.push("Amenity coverage is sparse in the bundled static dataset.");
  return [Number(clamp(value).toFixed(1)), reasons];
}

function planningScore() {
  return [85, ["Planning zones are not bundled in the static MVP, so this is context only."]];
}

function overallScore(transport, amenities, planning) {
  return Number((transport * 0.45 + amenities * 0.45 + planning * 0.1).toFixed(1));
}

export async function staticGeocode(query) {
  const normalised = query.trim();
  if (!normalised) return { results: [] };

  const key = cacheKey("geocode", normalised);
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const payload = await loadData();
  const localResults = payload.properties
    .filter((property) => {
      const haystack = `${property.address} ${property.suburb} ${property.lga}`.toLowerCase();
      return haystack.includes(normalised.toLowerCase());
    })
    .slice(0, 5)
    .map((property) => ({
      display_name: `${property.address} (${property.lga})`,
      lat: Number(property.lat),
      lon: Number(property.lon),
      type: "bundled demo location"
    }));

  const params = new URLSearchParams({
    q: `${normalised}, Victoria, Australia`,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "au",
    viewbox: "140.9,-33.8,150.2,-39.3",
    bounded: "1"
  });

  let nominatimResults = [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        Accept: "application/json"
      }
    });
    if (response.ok) {
      const nominatimPayload = await response.json();
      nominatimResults = nominatimPayload.map((item) => ({
        display_name: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
        type: item.type || item.class || "place"
      }));
    }
  } catch {
    if (!localResults.length) {
      throw new Error("Geocoding service unavailable.");
    }
  }

  const result = {
    results: [...localResults, ...nominatimResults].slice(0, 5)
  };
  localStorage.setItem(key, JSON.stringify(result));
  return result;
}

export async function staticLocationReport({ lat, lon, radius }) {
  const payload = await loadData();
  const features = normaliseFeatures(payload);
  const nearby = featuresWithin(features, lat, lon, Math.max(radius, 2000));
  const transportFeatures = nearby.filter((feature) => TRANSPORT.has(feature.category) && feature.distance_m <= radius);
  const amenityFeatures = nearby.filter((feature) => !TRANSPORT.has(feature.category) && feature.distance_m <= radius);

  const nearestTransport = {
    train: nearestByCategory(features, lat, lon, new Set(["train"])),
    tram: nearestByCategory(features, lat, lon, new Set(["tram"])),
    bus: nearestByCategory(features, lat, lon, new Set(["bus"]))
  };
  const nearestAmenities = Object.fromEntries(
    Object.entries(AMENITY_GROUPS).map(([name, categories]) => [name, nearestByCategory(features, lat, lon, categories)])
  );
  const transportCounts = countsForCategories(nearby, TRANSPORT, [400, 800, 2000]);
  const amenityCounts = Object.fromEntries(
    Object.entries(AMENITY_GROUPS).map(([name, categories]) => {
      const counts = countsForCategories(nearby, categories, [400, 800, 2000]);
      return [
        name,
        Object.fromEntries(
          Object.entries(counts).map(([radiusName, values]) => [
            radiusName,
            [...categories].reduce((sum, category) => sum + (values[category] || 0), 0)
          ])
        )
      ];
    })
  );
  const rawAmenityCounts = Object.fromEntries(
    [...RAW_AMENITIES].map((category) => [
      category,
      countsForCategories(nearby, new Set([category]), [2000]).within_2000m[category]
    ])
  );
  const rawNearestAmenities = Object.fromEntries(
    [...RAW_AMENITIES].map((category) => [category, nearestByCategory(features, lat, lon, new Set([category]))])
  );

  const [transportValue, transportReasons] = transportScore(nearestTransport, transportCounts.within_800m);
  const [amenityValue, amenityReasons] = amenityScore(rawNearestAmenities, rawAmenityCounts);
  const [planningValue, planningReasons] = planningScore();
  const context = nearestPropertyContext(payload, lat, lon);
  const address =
    context.reference_distance_km <= 2
      ? context.reference_location
      : `Selected map point near ${context.suburb || "Victoria"}`;

  return {
    location: {
      lat,
      lon,
      address,
      suburb: context.suburb,
      lga: context.lga,
      reference_distance_km: context.reference_distance_km
    },
    transport: {
      nearest_train: nearestTransport.train,
      nearest_tram: nearestTransport.tram,
      nearest_bus: nearestTransport.bus,
      counts: transportCounts
    },
    amenities: {
      counts: amenityCounts,
      nearest: nearestAmenities
    },
    planning: {
      zone: "Not loaded in static MVP",
      overlays: [],
      note: "Planning zones and overlays need a Vicmap Planning data import. Check official Victorian Government tools before making decisions."
    },
    scores: {
      transport_score: transportValue,
      amenity_score: amenityValue,
      planning_context_score: planningValue,
      overall_score: overallScore(transportValue, amenityValue, planningValue),
      reasons: {
        transport: transportReasons,
        amenities: amenityReasons,
        planning: planningReasons
      },
      weights: { transport: 0.45, amenities: 0.45, planning: 0.1 }
    },
    map_features: {
      transport: transportFeatures.slice(0, 300),
      schools: amenityFeatures.filter((feature) => feature.category === "school").slice(0, 150),
      health: amenityFeatures.filter((feature) => feature.category === "health").slice(0, 80),
      retail: amenityFeatures.filter((feature) => feature.category === "retail").slice(0, 80),
      parks_sport: amenityFeatures.filter((feature) => feature.category === "sport").slice(0, 150)
    }
  };
}
