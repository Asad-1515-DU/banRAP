/**
 * Label Data Validation Schemas for BanRAP
 * Ensures all label data conforms to expected enum values before database storage
 */

// Valid enum values from schema
const ROADSIDE_OBJECTS = ['METAL', 'CONCRETE', 'TREE', 'POLE', 'NO_OBJECT'];
const DISTANCES = ['0-1', '1-5', '5-10', '10+'];
const INTERSECTION_TYPES = ['4-leg', '4-leg-signalised', '3-leg', 'roundabout', '3-leg-signalised', 'railway-crossing', 'merge-lane'];
const QUALITIES = ['poor', 'adequate', 'not-applicable'];
const CHANNELISATION_OPTIONS = ['not-present', 'present'];
const SPEED_LIMITS = ['present', 'not-present'];
const SPEED_MANAGEMENT = ['20', '30', '40', '50', '60', '70', '80', '90', '100'];

/**
 * Validates roadside data structure
 * @param {Object} roadsideData - The roadside data object
 * @returns {Object} {isValid: boolean, errors?: Array}
 */
export const validateRoadsideData = (roadsideData) => {
  if (!roadsideData) {
    return { isValid: true }; // Optional field
  }

  const errors = [];

  if (roadsideData.leftObject !== null && roadsideData.leftObject !== undefined) {
    if (!ROADSIDE_OBJECTS.includes(roadsideData.leftObject)) {
      errors.push(`Invalid leftObject: "${roadsideData.leftObject}". Must be one of: ${ROADSIDE_OBJECTS.join(', ')}`);
    }
  }

  if (roadsideData.rightObject !== null && roadsideData.rightObject !== undefined) {
    if (!ROADSIDE_OBJECTS.includes(roadsideData.rightObject)) {
      errors.push(`Invalid rightObject: "${roadsideData.rightObject}". Must be one of: ${ROADSIDE_OBJECTS.join(', ')}`);
    }
  }

  if (roadsideData.distanceObject !== null && roadsideData.distanceObject !== undefined) {
    if (!DISTANCES.includes(roadsideData.distanceObject)) {
      errors.push(`Invalid distanceObject: "${roadsideData.distanceObject}". Must be one of: ${DISTANCES.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validates intersection data structure
 * @param {Object} intersectionData - The intersection data object
 * @returns {Object} {isValid: boolean, errors?: Array}
 */
export const validateIntersectionData = (intersectionData) => {
  if (!intersectionData) {
    return { isValid: true }; // Optional field
  }

  const errors = [];

  if (intersectionData.type !== null && intersectionData.type !== undefined) {
    if (!INTERSECTION_TYPES.includes(intersectionData.type)) {
      errors.push(`Invalid type: "${intersectionData.type}". Must be one of: ${INTERSECTION_TYPES.join(', ')}`);
    }
  }

  if (intersectionData.quality !== null && intersectionData.quality !== undefined) {
    if (!QUALITIES.includes(intersectionData.quality)) {
      errors.push(`Invalid quality: "${intersectionData.quality}". Must be one of: ${QUALITIES.join(', ')}`);
    }
  }

  if (intersectionData.channelisation !== null && intersectionData.channelisation !== undefined) {
    if (!CHANNELISATION_OPTIONS.includes(intersectionData.channelisation)) {
      errors.push(`Invalid channelisation: "${intersectionData.channelisation}". Must be one of: ${CHANNELISATION_OPTIONS.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validates speed data structure
 * @param {Object} speedData - The speed data object
 * @returns {Object} {isValid: boolean, errors?: Array}
 */
export const validateSpeedData = (speedData) => {
  if (!speedData) {
    return { isValid: true }; // Optional field
  }

  const errors = [];

  if (speedData.speedLimit !== null && speedData.speedLimit !== undefined) {
    if (!SPEED_LIMITS.includes(speedData.speedLimit)) {
      errors.push(`Invalid speedLimit: "${speedData.speedLimit}". Must be one of: ${SPEED_LIMITS.join(', ')}`);
    }
  }

  if (speedData.management !== null && speedData.management !== undefined) {
    // Management can be multiple values comma-separated
    const values = speedData.management.split(',').map(v => v.trim());
    const invalidValues = values.filter(v => !SPEED_MANAGEMENT.includes(v));
    
    if (invalidValues.length > 0) {
      errors.push(`Invalid management values: ${invalidValues.join(', ')}. Must be one of: ${SPEED_MANAGEMENT.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validates all label data together
 * @param {Object} labelData - Complete label data
 * @returns {Object} {isValid: boolean, errors?: Array}
 */
export const validateLabelData = (labelData) => {
  const allErrors = [];

  const roadsideValidation = validateRoadsideData(labelData.roadsideData);
  if (!roadsideValidation.isValid) {
    allErrors.push(...roadsideValidation.errors);
  }

  const intersectionValidation = validateIntersectionData(labelData.intersectionData);
  if (!intersectionValidation.isValid) {
    allErrors.push(...intersectionValidation.errors);
  }

  const speedValidation = validateSpeedData(labelData.speedData);
  if (!speedValidation.isValid) {
    allErrors.push(...speedValidation.errors);
  }

  // At least one of the three data types should be provided
  if (!labelData.roadsideData && !labelData.intersectionData && !labelData.speedData) {
    allErrors.push('At least one of roadsideData, intersectionData, or speedData must be provided');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined
  };
};

/**
 * Sanitizes and normalizes label data
 * @param {Object} labelData - Raw label data
 * @returns {Object} Sanitized label data
 */
export const sanitizeLabelData = (labelData) => {
  const sanitized = {};

  if (labelData.roadsideData) {
    sanitized.roadsideData = {
      leftObject: labelData.roadsideData.leftObject || null,
      rightObject: labelData.roadsideData.rightObject || null,
      distanceObject: labelData.roadsideData.distanceObject || null
    };
  }

  if (labelData.intersectionData) {
    sanitized.intersectionData = {
      type: labelData.intersectionData.type || null,
      quality: labelData.intersectionData.quality || null,
      channelisation: labelData.intersectionData.channelisation || null
    };
  }

  if (labelData.speedData) {
    sanitized.speedData = {
      speedLimit: labelData.speedData.speedLimit || null,
      management: labelData.speedData.management || null
    };
  }

  return sanitized;
};
