const debugSession = (req, res, next) => {
  console.log("Session Debug -----");
  console.log("Session ID:", req.sessionID);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);
  console.log("Session:", req.session);
  next();
};

module.exports = debugSession;
