const config = require("config");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  authenticateLocal,
  authenticateGoogle,
  authenticateFacebook
} = require("./authController");

// POST /
// Local authentication
router.post(
  "/",
  passport.authenticate("local", { session: false }),
  authenticateLocal
);

// GOOGLE
router.get("/google", authenticateGoogle);

// FACEBOOK
router.get("/facebook", authenticateFacebook);

module.exports = router;
