export const validateBody = (rules) => (req, res, next) => {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];
    if (rule.required && (value === undefined || value === null || value === '')) errors.push(`${field} is required`);
    if (value !== undefined && rule.enum && !rule.enum.includes(value)) errors.push(`${field} is invalid`);
    if (value !== undefined && rule.type && typeof value !== rule.type) errors.push(`${field} must be ${rule.type}`);
  }
  if (errors.length) {
    res.status(400);
    return next(new Error(errors.join(', ')));
  }
  return next();
};
