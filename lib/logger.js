const { createLogger, format, transports } = require("winston");
const { combine, simple, json, colorize, timestamp, prettyPrint } = format;

module.exports = () => {
  const logger = new createLogger({
    level: "info",
    format: combine(timestamp(), json()),
    //defaultMeta: { service: "user-service" },
    transports: [
      new transports.File({ filename: "error.log", level: "error" }),
      new transports.File({ filename: "logfile.log" })
    ]
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new transports.Console({
        format: combine(timestamp(), prettyPrint(), colorize())
      })
    );
  }

  return logger;
};
