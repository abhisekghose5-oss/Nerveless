// Simple per-user in-memory rate limiter for demo purposes
// NOTE: For production use Redis or a distributed store; this implementation
// is single-process and will reset on process restart.
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 60; // per window per user

// buckets maps userKey -> { count, start }
const buckets = new Map();

function _getKey(req) {
  // Prefer stable user id when authenticated, fall back to IP for anonymous
  if (req.user && req.user._id) return String(req.user._id);
  return req.ip || req.headers["x-forwarded-for"] || "anon";
}

/**
 * Middleware: matchLimiter
 * - Enforces a fixed number of requests per window per user
 * - Sets `Retry-After` header when limiting
 */
function matchLimiter(req, res, next) {
  const key = _getKey(req);
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now - entry.start >= WINDOW_MS) {
    // new window
    entry = { count: 1, start: now };
    buckets.set(key, entry);
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.start + WINDOW_MS - now) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many requests", retryAfter });
  }

  entry.count += 1;
  buckets.set(key, entry);
  return next();
}

module.exports = { matchLimiter };
