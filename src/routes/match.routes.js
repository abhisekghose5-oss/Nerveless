const express = require("express");
const router = express.Router();
const matchController = require("../controllers/match.controller");
const auth = require("../middleware/auth.middleware");
const { matchRateLimiter } = require("../middleware/rateLimitRedis.middleware");

// Route: POST /api/match
// - Protected by JWT auth
// - Students only (RBAC)
// - Per-user rate limiter
router.post(
  "/",
  auth.ensureAuth,
  auth.ensureRole("student"),
  matchRateLimiter,
  matchController.getMatches
);

module.exports = router;
