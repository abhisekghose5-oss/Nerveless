const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/auth.controller");

// Register route with simple validation
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").isLength({ min: 2 }),
  body("role").isIn(["student", "alumni"]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  authController.register
);

// Login route
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  authController.login
);

module.exports = router;
