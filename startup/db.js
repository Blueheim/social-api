const mongoose = require("mongoose");
const config = require("config");

const db = config.get("DB");
module.exports = () => {
  mongoose
    .connect(db)
    .then(() => console.log(`Connected to ${db}`))
    .catch(err => {
      throw Error("Can't connect to database");
    });
};
