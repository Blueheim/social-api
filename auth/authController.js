exports.authenticateLocal = async (req, res) => {
  //res.redirect('/');

  // const token = req.user.generateAuthToken();
  // const authUser = await req.user.dbSetAuthToken(token);

  res.status(200).send({ token: req.user.token });
};

exports.authenticateGoogle = (req, res) => {
  res.send(req.user);
};

exports.authenticateFacebook = (req, res) => {
  res.send(req.user);
};
