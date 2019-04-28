module.exports = errorHandler => (err, req, res, next) => {
  if (errorHandler.isTrustedError(err)) {
    console.log(err);
    if (err.httpStatusCode && err.message) {
      console.log(err.httpStatusCode);
      return res.status(err.httpStatusCode).json({ error: err.message });
    }
  } else {
    console.log(err);
    errorHandler.handle(err, res);
    res.status(500).json({ error: "Unexpected error" });
  }
};
