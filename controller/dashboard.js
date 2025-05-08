function getDashboard(req, res) {
  res.render("dashboard", {
    currentPath: [],
  });
}

module.exports = { getDashboard };
