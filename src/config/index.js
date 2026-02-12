// Centralized configuration values and sensible defaults.
// Keep this file minimal and environment-driven.
const currentYear = new Date().getFullYear();

module.exports = {
  // MongoDB connection string used by src/models/index.js
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/nerveless-dev",
  // Secret used for signing JWTs (override in production)
  // JWT signing configuration: supports HS256 (shared secret) or RS256 (RSA keys)
  JWT_ALG:
    process.env.JWT_ALG ||
    (process.env.JWT_PRIVATE_KEY || process.env.JWT_PUBLIC_KEY
      ? "RS256"
      : "HS256"),
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  JWT_PRIVATE_KEY:
    process.env.JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY_PATH || null,
  JWT_PUBLIC_KEY:
    process.env.JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY_PATH || null,
  // HTTP port
  PORT: process.env.PORT || 3000,
  // Redis connection string for rate limiter (optional)
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  // helper constant
  CURRENT_YEAR: currentYear,
};
