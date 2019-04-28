const { AppError } = require("@blueheim/node-utils");
const config = require("config");
const _ = require("lodash");
const { model } = require("./user");
const fetch = require("node-fetch");

exports.getUsers = async (req, res) => {
  const users = await model.dbGetAll();
  res.send(users);
};

exports.getUserById = async (req, res) => {
  const user = await model.dbGetById(req.params.id);
  res.send(user);
};

exports.createUser = async (req, res) => {
  if (await model.dbGetByEmail(req.body.email)) {
    throw new AppError({
      name: "RECORD_EXISTS",
      description: "User already exists in the database",
      isOperational: true,
      httpStatusCode: 400,
      message: "User already registered"
    });
  }

  // TODO: transaction

  const user = await model.dbCreate(req.body, "local");

  // Create user in remote auth api
  // const fetchResult = await fetch(`${config.get("AUTH_API_URL")}/api/users/`, {
  //   method: "post",
  //   body: JSON.stringify(_.pick(req.body, ["email", "password"])),
  //   headers: { "Content-Type": "application/json" }
  // });

  //const fetchData = await fetchResult.json();

  const token = user.generateAuthToken();

  const resUser = _.pick(user, ["_id", "name", "email"]);
  resUser.token = token;

  res.status(201).json(resUser);
};
