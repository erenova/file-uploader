function redirectAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = redirectAuthenticated;
