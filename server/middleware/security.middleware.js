const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

const cleanValue = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/\son\w+\s*=/gi, '');
  }
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !dangerousKeys.has(key) && !key.startsWith('$') && !key.includes('.'))
        .map(([key, item]) => [key, cleanValue(item)]),
    );
  }
  return value;
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = cleanValue(req.body);
  next();
};
