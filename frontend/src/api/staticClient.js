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

async function fetchNominatimJson(params, endpoint = "search") {
  const response = await fetch(`https://nominatim.openstreetmap.org/${endpoint}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en-AU,en;q=0.9"
    }
  });
  if (!response.ok) {
    throw new Error(`Nominatim request failed with ${response.status}`);
  }
  return response.json();
}

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
    property: nearest.property,
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
      type: "bundled demo location",
      addresstype: "address",
      address: {
        suburb: property.suburb,
        state: "Victoria",
        country: "Australia"
      }
    }));

  const params = new URLSearchParams({
    q: `${normalised}, Victoria, Australia`,
    format: "jsonv2",
    addressdetails: "1",
    polygon_geojson: "1",
    limit: "5",
    countrycodes: "au",
    viewbox: "140.9,-33.8,150.2,-39.3",
    bounded: "1"
  });
  params.set("accept-language", "en");

  let nominatimResults = [];
  try {
    const nominatimPayload = await fetchNominatimJson(params);
    nominatimResults = nominatimPayload.map((item) => ({
      display_name: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      type: item.type || item.class || "place",
      addresstype: item.addresstype || item.type || item.class || "place",
      address: item.address || null,
      geojson: item.geojson || null
    }));
  } catch {
    if (!localResults.length) {
      throw new Error("Geocoding service unavailable.");
    }
  }

  const mergedResults = [...localResults, ...nominatimResults].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.display_name === item.display_name && candidate.lat === item.lat && candidate.lon === item.lon) === index
  );

  const areaRank = {
    postcode: 0,
    suburb: 0,
    administrative: 1,
    city_district: 1,
    town: 1,
    village: 1,
    locality: 1,
    address: 2
  };

  mergedResults.sort((left, right) => {
    const leftRank = areaRank[left.addresstype] ?? 3;
    const rightRank = areaRank[right.addresstype] ?? 3;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return left.display_name.localeCompare(right.display_name);
  });

  const result = {
    results: mergedResults.slice(0, 5)
  };
  localStorage.setItem(key, JSON.stringify(result));
  return result;
}

export async function staticAreaBoundary({ lat, lon }) {
  const key = cacheKey("area-boundary", `${lat},${lon}`);
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const reverseParams = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "14"
  });
  reverseParams.set("accept-language", "en");

  try {
    const reversePayload = await fetchNominatimJson(reverseParams, "reverse");
    const suburbLabel =
      reversePayload.address?.suburb ||
      reversePayload.address?.city_district ||
      reversePayload.address?.town ||
      reversePayload.address?.village ||
      reversePayload.address?.city;
    const postcode = reversePayload.address?.postcode;

    if (!suburbLabel && !postcode) {
      localStorage.setItem(key, "null");
      return null;
    }

    const searchParams = new URLSearchParams({
      q: [suburbLabel, postcode, "Victoria", "Australia"].filter(Boolean).join(", "),
      format: "jsonv2",
      addressdetails: "1",
      polygon_geojson: "1",
      limit: "5",
      countrycodes: "au"
    });
    searchParams.set("accept-language", "en");

    const areaResults = await fetchNominatimJson(searchParams);
    const area =
      areaResults.find((item) => ["suburb", "postcode", "administrative", "city_district", "town", "village", "locality"].includes(item.addresstype) && item.geojson) ||
      areaResults.find((item) => item.geojson) ||
      null;

    const result = area
      ? {
          label: area.name || suburbLabel || postcode || reversePayload.display_name,
          type: area.addresstype || area.type || "area",
          geojson: area.geojson,
          boundingbox: area.boundingbox || null
        }
      : null;

    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch {
    localStorage.setItem(key, "null");
    return null;
  }
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
  const referenceProperty = context.property;
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
    profile: referenceProperty
      ? {
          suburb: referenceProperty.suburb,
          lga: referenceProperty.lga,
          reference_property_id: referenceProperty.property_id,
          reference_distance_km: context.reference_distance_km,
          lga_travel_time_to_melbourne_min: referenceProperty.lga_travel_time_to_melbourne_min ?? null,
          lga_distance_to_melbourne_km: referenceProperty.lga_distance_to_melbourne_km ?? null,
          gps_per_1000_pop: referenceProperty.gps_per_1000_pop ?? null,
          pharms_per_1000_pop: referenceProperty.pharms_per_1000_pop ?? null,
          schools_5km: referenceProperty.schools_5km ?? null,
          health_5km: referenceProperty.health_5km ?? null,
          sport_2km: referenceProperty.sport_2km ?? null,
          retail_2km: referenceProperty.retail_2km ?? null,
          notes: referenceProperty.notes || null
        }
      : null,
    commute: referenceProperty
      ? {
          target_distances: referenceProperty.target_distances || [],
          weighted_target_km: referenceProperty.weighted_target_km ?? null,
          commute_score: referenceProperty.commute_score ?? null,
          lga_travel_time_to_melbourne_min: referenceProperty.lga_travel_time_to_melbourne_min ?? null,
          methodology:
            "Target distances are bundled straight-line approximations. The Melbourne travel-time value is an area-level reference and can be replaced with routed ORS-style travel times in a future upgrade."
        }
      : null,
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
