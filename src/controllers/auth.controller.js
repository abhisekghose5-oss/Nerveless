const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user.model");
const Student = require("../models/student.model");
const Alumni = require("../models/alumni.model");

// Register handler: creates Student or Alumni based on `role` in body
// Body: { email, password, name, role: 'student'|'alumni', ...otherFields }
async function register(req, res, next) {
  try {
    const { email, password, name, role, ...rest } = req.body;
    if (!email || !password || !name || !role)
      return res.status(400).json({ error: "Missing required fields" });

    const existing = await User.findOne({ email }).lean();
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    const createData = { email, passwordHash, name, ...rest };
    if (role === "student") {
      user = await Student.create(createData);
    } else if (role === "alumni") {
      user = await Alumni.create(createData);
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    const payload = { _id: user._id, role: user.role, name: user.name };
    let signKey = config.JWT_SECRET;
    const signOpts = { expiresIn: "7d" };
    if (config.JWT_ALG && config.JWT_ALG.toUpperCase() === "RS256") {
      // load private key either from env variable or file path
      const fs = require("fs");
      const priv =
        config.JWT_PRIVATE_KEY && fs.existsSync(config.JWT_PRIVATE_KEY)
          ? fs.readFileSync(config.JWT_PRIVATE_KEY)
          : config.JWT_PRIVATE_KEY;
      if (!priv) throw new Error("JWT private key not configured");
      signKey = priv;
      signOpts.algorithm = "RS256";
    }
    const token = jwt.sign(payload, signKey, signOpts);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Login: verifies credentials and issues JWT
// Body: { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ email }).select("+passwordHash").lean();
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { _id: user._id, role: user.role, name: user.name };
    let signKey = config.JWT_SECRET;
    const signOpts = { expiresIn: "7d" };
    if (config.JWT_ALG && config.JWT_ALG.toUpperCase() === "RS256") {
      const fs = require("fs");
      const priv =
        config.JWT_PRIVATE_KEY && fs.existsSync(config.JWT_PRIVATE_KEY)
          ? fs.readFileSync(config.JWT_PRIVATE_KEY)
          : config.JWT_PRIVATE_KEY;
      if (!priv) throw new Error("JWT private key not configured");
      signKey = priv;
      signOpts.algorithm = "RS256";
    }
    const token = jwt.sign(payload, signKey, signOpts);
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
