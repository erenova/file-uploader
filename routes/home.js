const { Router } = require("express");
const controller = require("../controller/home");
const passport = require("../config/passport");
const redirectAuthenticated = require("../middleware/redirectAuthenticated");

const router = Router();

router.get("/", redirectAuthenticated, controller.getHome);

module.exports = router;
