/**
 * Coordinate Validation Utilities for BanRAP
 * Ensures all geographic data is valid before database storage
 */

/**
 * Validates a single coordinate object {lat, lng}
 * @param {Object} coord - The coordinate object
 * @param {number} coord.lat - Latitude (-90 to 90)
 * @param {number} coord.lng - Longitude (-180 to 180)
 * @returns {Object} {isValid: boolean, error?: string}
 */
export const validateCoordinate = (coord) => {
  if (!coord || typeof coord !== 'object') {
    return { isValid: false, error: 'Coordinate must be an object' };
  }

  if (coord.lat === undefined || coord.lat === null) {
    return { isValid: false, error: 'Latitude (lat) is required' };
  }

  if (coord.lng === undefined || coord.lng === null) {
    return { isValid: false, error: 'Longitude (lng) is required' };
  }

  const lat = parseFloat(coord.lat);
  const lng = parseFloat(coord.lng);

  if (isNaN(lat)) {
    return { isValid: false, error: 'Latitude must be a number' };
  }

  if (isNaN(lng)) {
    return { isValid: false, error: 'Longitude must be a number' };
  }

  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }

  // Check and round to max 8 decimal places (~1mm accuracy)
  const roundedLat = Math.round(lat * 100000000) / 100000000;
  const roundedLng = Math.round(lng * 100000000) / 100000000;

  return { isValid: true, lat: roundedLat, lng: roundedLng };
};

/**
 * Validates that two coordinates are different (prevents degenerate roads)
 * @param {Object} coord1 - First coordinate
 * @param {Object} coord2 - Second coordinate
 * @returns {Object} {isValid: boolean, error?: string}
 */
export const validateCoordinatesDifferent = (coord1, coord2) => {
  if (!coord1 || !coord2) {
    return { isValid: false, error: 'Both coordinates required' };
  }

  const validation1 = validateCoordinate(coord1);
  if (!validation1.isValid) return validation1;

  const validation2 = validateCoordinate(coord2);
  if (!validation2.isValid) return validation2;

  // Use rounded values for comparison
  const lat1 = validation1.lat;
  const lng1 = validation1.lng;
  const lat2 = validation2.lat;
  const lng2 = validation2.lng;

  if (lat1 === lat2 && lng1 === lng2) {
    return { isValid: false, error: 'Start and end coordinates must be different' };
  }

  return { isValid: true };
};

/**
 * Safely parses coordinate JSON string
 * @param {string} coordString - JSON string of coordinate
 * @returns {Object} {coord: {lat, lng} | null, error?: string}
 */
export const parseCoordinate = (coordString) => {
  if (!coordString) {
    return { coord: null, error: 'Coordinate string is required' };
  }

  try {
    const coord = JSON.parse(coordString);
    const validation = validateCoordinate(coord);
    if (!validation.isValid) {
      return { coord: null, error: validation.error };
    }
    // Return the rounded coordinate values from validation
    return { coord: { lat: validation.lat, lng: validation.lng } };
  } catch (e) {
    return { coord: null, error: `Invalid coordinate JSON: ${e.message}` };
  }
};

/**
 * Validates array of coordinates (for segments)
 * @param {Array} coordinates - Array of coordinate objects
 * @returns {Object} {isValid: boolean, error?: string, invalid?: Array}
 */
export const validateCoordinateArray = (coordinates) => {
  if (!Array.isArray(coordinates)) {
    return { isValid: false, error: 'Coordinates must be an array' };
  }

  if (coordinates.length < 2) {
    return { isValid: false, error: 'At least 2 coordinates required' };
  }

  const invalid = [];
  for (let i = 0; i < coordinates.length; i++) {
    const validation = validateCoordinate(coordinates[i]);
    if (!validation.isValid) {
      invalid.push({ index: i, error: validation.error });
    }
  }

  if (invalid.length > 0) {
    return { isValid: false, error: `Invalid coordinates at indices: ${invalid.map(i => i.index).join(', ')}`, invalid };
  }

  return { isValid: true };
};

/**
 * Calculates distance between two coordinates (Haversine formula) in kilometers
 * @param {Object} coord1 - First coordinate
 * @param {Object} coord2 - Second coordinate
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const lat1 = (parseFloat(coord1.lat) * Math.PI) / 180;
  const lat2 = (parseFloat(coord2.lat) * Math.PI) / 180;
  const deltaLat = ((parseFloat(coord2.lat) - parseFloat(coord1.lat)) * Math.PI) / 180;
  const deltaLng = ((parseFloat(coord2.lng) - parseFloat(coord1.lng)) * Math.PI) / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Validates segments are within reasonable distance of road
 * @param {Object} roadStart - Road start coordinate
 * @param {Object} roadEnd - Road end coordinate
 * @param {Array} segments - Array of segments
 * @returns {Object} {isValid: boolean, error?: string}
 */
export const validateSegmentsWithinRoad = (roadStart, roadEnd, segments) => {
  const roadDistance = calculateDistance(roadStart, roadEnd);
  const maxDeviation = roadDistance * 1.5; // Allow 50% deviation

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segStart = calculateDistance(roadStart, seg.startPoint);
    const segEnd = calculateDistance(roadEnd, seg.endPoint);

    if (segStart > maxDeviation || segEnd > maxDeviation) {
      return {
        isValid: false,
        error: `Segment ${i + 1} is too far from road boundaries`
      };
    }
  }

  return { isValid: true };
};

/**
 * Sanitizes coordinate for database storage
 * @param {Object} coord - Coordinate object
 * @returns {Object} Sanitized coordinate
 */
export const sanitizeCoordinate = (coord) => {
  return {
    lat: parseFloat(coord.lat).toFixed(8),
    lng: parseFloat(coord.lng).toFixed(8)
  };
};
