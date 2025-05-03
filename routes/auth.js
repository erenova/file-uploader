const { Router } = require("express");
const auth = require("../controller/auth");
const passport = require("../config/passport");
const prisma = require("../utils/db");
const redirectAuthenticated = require("../middleware/redirectAuthenticated");
const router = Router();

router.get("/auth/register", redirectAuthenticated, auth.getRegister);
router.post("/auth/register", auth.validateRegister, auth.postRegister);
router.get("/auth/login", redirectAuthenticated, auth.getLogin);
router.post("/auth/login", auth.validateLogin, auth.postLogin);
router.get("/auth/logout", auth.getLogout);

module.exports = router;
