const { Router } = require("express");
const controller = require("../controller/home");
const passport = require("../config/passport");

const router = Router();

router.get("/", controller.getHome);

router.get("/login", (req, res) => {
  res.render("login"); // ya da plain text: res.send('Login Page');
});
router.post(
  "/login",
  (req, res, next) => {
    console.log("Login endpoint hit");
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/success",
    failureRedirect: "/error",
    failureFlash: false,
  }),
);

router.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.send("You are authenticated!");
});

module.exports = router;
