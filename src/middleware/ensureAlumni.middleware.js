/**
 * ensureAlumni middleware
 * - Secure middleware to verify the authenticated user has role 'alumni'
 * - Designed to be used after JWT authentication middleware that sets `req.user`
 *
 * Usage:
 *   app.use('/api/alumni', ensureAuth, ensureAlumni, alumniRoutes)
 */
module.exports = function ensureAlumni(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    // Accept either string role or discriminator on payload
    const role = req.user.role || (req.user.role && String(req.user.role));
    if (role === "alumni") return next();

    // For safety, support uppercase variants
    if (typeof role === "string" && role.toLowerCase() === "alumni")
      return next();

    return res.status(403).json({ error: "Forbidden - alumni only" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
