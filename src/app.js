/**
 * Application entry point
 * - Connects to MongoDB
 * - Configures Express middleware and routes
 * - Starts HTTP server
 */
const express = require("express");
const config = require("./config");
const { connect } = require("./models/index");
const matchRoutes = require("./routes/match.routes");

async function start() {
  // connect to MongoDB (throws on failure)
  await connect(config.MONGO_URI);

  const app = express();
  // parse JSON bodies
  app.use(express.json());
  // enable CORS for frontend during development
  try {
    const cors = require("cors");
    app.use(cors());
  } catch (e) {
    // if dependency missing, send minimal CORS headers
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
  }

  // Simple health-check endpoint
  app.get("/health", (req, res) => res.json({ ok: true }));

  // Mount API routes - auth and match
  const authRoutes = require("./routes/auth.routes");
  app.use("/api/auth", authRoutes);
  // match service (requires authentication)
  app.use("/api/match", matchRoutes);

  // Centralized error handler (minimal for demo)
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "server error" });
  });

  // If frontend build exists, serve it (production mode)
  const path = require("path");
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  try {
    app.use(express.static(frontendDist));
    app.get("*", (req, res) =>
      res.sendFile(path.join(frontendDist, "index.html"))
    );
  } catch (e) {
    // ignore if no frontend built
  }

  const port = config.PORT;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

// start app, exit non-zero on failure
start().catch((err) => {
  console.error("Failed to start app", err);
  process.exit(1);
});
