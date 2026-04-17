function validateRequest(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const rule of schema) {
      const value = req.body[rule.field];
      const hasValue = value !== undefined && value !== null;

      if (rule.required && !hasValue) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (!hasValue) {
        continue;
      }

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
      }

      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${rule.field} must be a number`);
      }

      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${rule.field} must be an array`);
      }

      if (rule.type === 'objectId') {
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;

        if (typeof value !== 'string' || !objectIdPattern.test(value)) {
          errors.push(`${rule.field} must be a valid MongoDB ObjectId`);
        }
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
      }

      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push(`${rule.field} must be at least ${rule.min}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}

module.exports = validateRequest;
