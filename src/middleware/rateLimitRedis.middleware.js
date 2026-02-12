const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");
const config = require("../config");

// Configuration: default to 100 requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = process.env.MATCH_MAX_REQUESTS
  ? parseInt(process.env.MATCH_MAX_REQUESTS, 10)
  : 100;

// Start with an in-memory limiter so routes can mount synchronously.
let limiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again later." },
});

// Try to initialize Redis-backed limiter asynchronously. If Redis is
// available, replace the in-memory limiter with the Redis-backed one.
(async function initRedisLimiter() {
  try {
    const redisClient = new Redis(config.REDIS_URL, { connectTimeout: 1000 });
    redisClient.on("error", (e) => {
      console.debug("ioredis error (ignored):", e && e.message);
    });

    // quick ping to verify connection
    await redisClient.ping();

    const store = new RedisStore({ client: redisClient });

    limiter = rateLimit({
      windowMs: WINDOW_MS,
      max: MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      store,
      message: { error: "Too many requests, try again later." },
    });

    console.log("Rate limiter: using Redis store");
  } catch (err) {
    console.warn(
      "Rate limiter: Redis not available, continuing with in-memory store"
    );
  }
})();

module.exports = {
  matchRateLimiter: (req, res, next) => limiter(req, res, next),
};
