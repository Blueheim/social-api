const config = require("config");
const fetch = require("node-fetch");
const passport = require("passport");
const { model: User } = require("../users/user");
const LocalStrategy = require("passport-local");
const BearerStrategy = require("passport-http-bearer").Strategy;
const jwt = require("jsonwebtoken");

module.exports = function(app) {
  app.use(passport.initialize());
  // app.use(passport.session());

  // passport.serializeUser((user, cb) => {
  //   cb(null, user);
  // });

  // passport.deserializeUser((obj, cb) => {
  //   cb(null, obj);
  // });

  // Passport bearer strategy for non-auth api endpoint protection
  passport.use(
    new BearerStrategy((token, done) => {
      const user = null;

      try {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey")); //Throw exception if token invalid
        user = decoded;
      } catch (err) {
        return done(err);
      }

      // User not found
      if (!user) {
        return done(null, false);
      }

      return done(null, user, { scope: "read" });
    })
  );

  // local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false
      },
      async (email, password, done) => {
        // Create user in remote auth api
        try {
          const fetchResult = await fetch(
            `${config.get("AUTH_API_URL")}/api/auth/`,
            {
              method: "post",
              body: JSON.stringify({ email, password }),
              headers: { "Content-Type": "application/json" }
            }
          );

          fetchData = await fetchResult.json();

          return done(null, fetchData, {
            message: "User granted"
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
