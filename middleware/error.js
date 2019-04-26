module.exports = errorHandler => (err, req, res, next) => {
  if (errorHandler.isTrustedError(err)) {
    if (err.httpStatusCode && err.message) {
      res.status(err.httpStatusCode).send(err.message);
    }
  } else {
    console.log(err);
    errorHandler.handle(err, res);
    res.status(500).send("Unexpected error");
  }
};
