const { AppError } = require("@blueheim/node-utils");

module.exports = validator => {
  return (req, res, next) => {
    const { error } = validator(req.body);

    if (error) {
      //400 Bad request
      throw new AppError({
        name: "SCHEMA_INVALID",
        description: "Schema object is not valid",
        httpStatusCode: 400,
        message: error.details[0].message,
        isOperational: true
      });
    }
    next();
  };
};
