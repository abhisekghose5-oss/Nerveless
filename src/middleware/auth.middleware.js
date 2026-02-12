const jwt = require("jsonwebtoken");
const config = require("../config");
const fs = require("fs");

// helper to obtain verify key depending on algorithm
function getVerifyKey() {
  if (config.JWT_ALG && config.JWT_ALG.toUpperCase() === "RS256") {
    if (config.JWT_PUBLIC_KEY && fs.existsSync(config.JWT_PUBLIC_KEY))
      return fs.readFileSync(config.JWT_PUBLIC_KEY);
    if (config.JWT_PUBLIC_KEY) return config.JWT_PUBLIC_KEY;
    throw new Error("JWT public key not configured");
  }
  return config.JWT_SECRET;
}

/**
 * Middleware: ensureAuth
 * - Validates Authorization header and verifies JWT
 * - Attaches decoded payload to `req.user`
 */
function ensureAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization" });
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "Bad Authorization format" });
  const token = parts[1];
  try {
    const verifyKey = getVerifyKey();
    const verifyOpts = {};
    if (config.JWT_ALG) verifyOpts.algorithms = [config.JWT_ALG];
    const payload = jwt.verify(token, verifyKey, verifyOpts);
    // payload expected to include at least `_id` and `role`
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Middleware factory: ensureRole
 * - Returns middleware that checks `req.user.role` against allowed roles
 * - Example: `ensureRole('student')` or `ensureRole(['admin','staff'])`
 */
function ensureRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return function (req, res, next) {
    if (!req.user || !req.user.role)
      return res.status(403).json({ error: "Forbidden" });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = { ensureAuth, ensureRole };
