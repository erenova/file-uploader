const { Router } = require("express");
const dashboard = require("../controller/dashboard");
const passport = require("passport");
const prisma = require("../utils/db");
const requireAuth = require("../middleware/requireAuth");
const router = Router();

router.get("/dashboard", requireAuth, dashboard.getDashboard);
// router.post("/auth/login", auth.postLogin);

module.exports = router;
