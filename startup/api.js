const express = require("express");
const users = require("../users/usersAPI");
const auth = require("../auth/authAPI");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
};
