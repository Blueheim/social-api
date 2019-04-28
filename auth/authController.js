const config = require("config");
const fetch = require("node-fetch");
const {
  generateUrl,
  getGoogleAccountFromCode
} = require("../lib/google-config");

exports.authenticateLocal = async (req, res) => {
  //res.redirect('/');

  // const token = req.user.generateAuthToken();
  // const authUser = await req.user.dbSetAuthToken(token);

  const token = req.user.generateAuthToken();
  const authUser = await req.user.dbSetAuthToken(token);

  res.status(200).send(authUser);
};

exports.getGoogleAuthUrl = (req, res) => {
  const url = generateUrl();
  res.json(url);
};

exports.authenticateGoogle = async (req, res) => {
  const infos = await getGoogleAccountFromCode(req.query.code);
  console.log(infos);

  res.json(req.user);
};

exports.authenticateFacebook = (req, res) => {
  res.json(req.user);
};
