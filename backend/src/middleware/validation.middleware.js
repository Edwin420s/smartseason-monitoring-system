// Validation middleware for API endpoints
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errorMessage 
      });
    }
    next();
  };
};

// Custom validation functions
const validators = {
  // Email validation
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation (min 8 chars, at least 1 letter, 1 number)
  isStrongPassword: (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Phone number validation (basic)
  isPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phone && phoneRegex.test(phone) && phone.length >= 10;
  },

  // GPS coordinates validation
  isLat: (lat) => {
    const latitude = parseFloat(lat);
    return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
  },

  isLng: (lng) => {
    const longitude = parseFloat(lng);
    return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
  },

  // Crop stage validation
  isCropStage: (stage) => {
    const validStages = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];
    return validStages.includes(stage);
  },

  // User role validation
  isUserRole: (role) => {
    const validRoles = ['ADMIN', 'AGENT'];
    return validRoles.includes(role);
  },

  // Field name validation
  isFieldName: (name) => {
    return name && typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
  },

  // Crop type validation
  isCropType: (type) => {
    return type && typeof type === 'string' && type.trim().length >= 2 && type.trim().length <= 50;
  },

  // UUID validation
  isUUID: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
};

// Validation rules for different endpoints
const validationSchemas = {
  // Registration validation
  register: {
    name: { required: true, validate: validators.isFieldName, message: 'Valid name required (2-100 characters)' },
    email: { required: true, validate: validators.isEmail, message: 'Valid email required' },
    password: { required: true, validate: validators.isStrongPassword, message: 'Password must be at least 8 characters with 1 letter and 1 number' },
    role: { required: false, validate: validators.isUserRole, message: 'Role must be ADMIN or AGENT' },
    phone: { required: false, validate: validators.isPhone, message: 'Valid phone number required' }
  },

  // Login validation
  login: {
    email: { required: true, validate: validators.isEmail, message: 'Valid email required' },
    password: { required: true, custom: (value) => value && value.length >= 1, message: 'Password required' }
  },

  // Field creation validation
  createField: {
    name: { required: true, validate: validators.isFieldName, message: 'Valid field name required (2-100 characters)' },
    cropType: { required: true, validate: validators.isCropType, message: 'Valid crop type required (2-50 characters)' },
    plantingDate: { required: true, custom: (value) => !isNaN(Date.parse(value)), message: 'Valid planting date required' },
    assignedAgentId: { required: true, validate: validators.isUUID, message: 'Valid agent ID required' },
    locationLat: { required: false, validate: validators.isLat, message: 'Valid latitude required (-90 to 90)' },
    locationLng: { required: false, validate: validators.isLng, message: 'Valid longitude required (-180 to 180)' }
  },

  // Field update validation
  updateField: {
    name: { required: false, validate: validators.isFieldName, message: 'Valid field name required (2-100 characters)' },
    cropType: { required: false, validate: validators.isCropType, message: 'Valid crop type required (2-50 characters)' },
    assignedAgentId: { required: false, validate: validators.isUUID, message: 'Valid agent ID required' },
    locationLat: { required: false, validate: validators.isLat, message: 'Valid latitude required (-90 to 90)' },
    locationLng: { required: false, validate: validators.isLng, message: 'Valid longitude required (-180 to 180)' }
  },

  // Field update submission validation
  submitUpdate: {
    stage: { required: true, validate: validators.isCropStage, message: 'Valid crop stage required (PLANTED, GROWING, READY, HARVESTED)' },
    notes: { required: false, custom: (value) => !value || value.length <= 1000, message: 'Notes must be less than 1000 characters' },
    latitude: { required: false, validate: validators.isLat, message: 'Valid latitude required (-90 to 90)' },
    longitude: { required: false, validate: validators.isLng, message: 'Valid longitude required (-180 to 180)' }
  }
};

// Manual validation function for complex validations
const validate = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}: ${rules.message}`);
      continue;
    }
    
    // Skip validation if field is not provided and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate using custom validator
    if (rules.validate && !rules.validate(value)) {
      errors.push(`${field}: ${rules.message}`);
    }
    
    // Validate using custom function
    if (rules.custom && !rules.custom(value)) {
      errors.push(`${field}: ${rules.message}`);
    }
  }
  
  return errors;
};

module.exports = {
  validateRequest,
  validationSchemas,
  validate,
  validators
};
