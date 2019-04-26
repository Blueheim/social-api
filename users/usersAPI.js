const express = require("express");
const router = express.Router();
const { validate } = require("./user");

const { getUsers, getUserById, createUser } = require("./usersController");

const validateRequestBody = require("../middleware/validateRequestBody");

router.get("/", getUsers);
router.get("/:id", getUserById);
// Sign up a new user
router.post("/", validateRequestBody(validate), createUser);

module.exports = router;
