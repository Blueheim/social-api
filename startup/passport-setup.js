const config = require("config");
const fetch = require("node-fetch");
const passport = require("passport");
const { model: User } = require("../users/user");
const LocalStrategy = require("passport-local");
const BearerStrategy = require("passport-http-bearer").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
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
  // passport.use(
  //   new LocalStrategy(
  //     {
  //       usernameField: "email",
  //       passwordField: "password",
  //       session: false
  //     },
  //     async (email, password, done) => {
  //       // Create user in remote auth api
  //       try {
  //         const fetchResult = await fetch(
  //           `${config.get("AUTH_API_URL")}/api/auth/`,
  //           {
  //             method: "post",
  //             body: JSON.stringify({ email, password }),
  //             headers: { "Content-Type": "application/json" }
  //           }
  //         );

  //         fetchData = await fetchResult.json();

  //         return done(null, fetchData, {
  //           message: "User granted"
  //         });
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false
      },
      (email, password, done) => {
        User.dbGetByEmail(email)
          .then(async user => {
            if (!user) {
              return done(null, false, { message: "Invalid email." });
            }

            const isValidPassword = await User.comparePassword(
              password,
              user.password
            );
            if (!isValidPassword) {
              return done(null, false, {
                message: "Invalid Password"
              });
            }

            return done(null, user, {
              message: "User granted"
            });
          })
          .catch(err => {
            return done(err);
          });
      }
    )
  );

  // oauth strategies
  const registerAuthUser = async (strategy, token, profile) => {
    const strategyKeyId = `${strategy}.id`;

    const user = await User.dbGetByOAuthId(strategyKeyId, profile.id);

    if (!user) {
      //creates a user with the access token given by oauth service
      const newUser = {
        authToken: token,
        [strategy]: {
          id: profile.id,
          name: profile.displayName
        }
      };

      if (typeof profile.emails != "undefined" && profile.emails.length > 0) {
        newUser[strategy].email = profile.emails[0].value;
      }
      await User.dbCreate(newUser, strategy);
      return newUser;
    } else {
      //user exist
      await user.dbSetAuthToken(token);
      return user;
    }

    // invoke cb with a user object set at req.user in route handlers after authentication
  };

  // Passport google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.get("GG_OAUTH2_CLIENT_ID"),
        clientSecret: config.get("GG_OAUTH2_CLIENT_SECRET"),
        callbackURL: config.get("GG_OAUTH2_CALLBACK_URL")
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const user = await registerAuthUser("google", accessToken, profile);
          if (user) {
            cb(null, user);
          }
        } catch (err) {
          cb(err);
        }
      }
    )
  );

  // Passport facebook strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.get("FB_APP_ID"),
        clientSecret: config.get("FB_SECRET_KEY"),
        callbackURL: config.get("FB_OAUTH_CALLBACK_URL"),
        profileFields: ["displayName", "emails"]
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const user = await registerAuthUser("facebook", accessToken, profile);
          if (user) {
            cb(null, user);
          }
        } catch (err) {
          cb(err);
        }
      }
    )
  );
};
