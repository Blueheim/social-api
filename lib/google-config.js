const config = require("config");
const { google } = require("googleapis");

//console.log(google.getSupportedAPIs());

/** Access infos */
const googleConfig = {
  clientID: config.get("GG_OAUTH2_CLIENT_ID"),
  clientSecret: config.get("GG_OAUTH2_CLIENT_SECRET"),
  callbackURL: config.get("GG_OAUTH2_CALLBACK_URL")
};

const createConnection = () => {
  return new google.auth.OAuth2(
    googleConfig.clientID,
    googleConfig.clientSecret,
    googleConfig.callbackURL
  );
};

/** Scope **/

const defaultScope = [
  "https://www.googleapis.com/auth/plus.me",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

/** Generate the url for the client to sign in and request access to the scope provided */
const getConnectionUrl = auth => {
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // access type and approval prompt will force a new refresh token to be generated for each sign in
    scope: defaultScope
  });
};

const generateUrl = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
};

/** Helper function to access to the google plus api */
const getGooglePlusApi = auth => {
  return google.plus({ version: "v1", auth });
};

/** Extract the email and id of the google account from the query 'code' parameter */
const getGoogleAccountFromCode = async code => {
  // get the auth "tokens" from the request
  const auth = createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;

  // add the tokens to the google api
  auth.setCredentials(tokens);

  // connect to google plus - need this to get the user's email
  const plus = getGooglePlusApi(auth);
  const me = await plus.people.get({ userId: "me" });

  // get the google id and email
  const userGoogleId = me.data.id;
  const userGoogleEmail =
    me.data.emails && me.data.emails.length && me.data.emails[0].value;

  // return for user sign in or sign up
  return {
    id: userGoogleId,
    email: userGoogleEmail,
    tokens: tokens
  };
};

module.exports = { generateUrl, getGoogleAccountFromCode };
