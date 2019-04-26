// uncaught synchronous exception handler

module.exports = errorHandler => {
  process.on("uncaughtException", error => {
    errorHandler.handle(error);
    process.exit(1); // eslint-disable-line no-process-exit
    // TODO:
    // Use a restarter tool to reboot
  });
};
