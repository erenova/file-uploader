const { Router } = require("express");
const { getTest } = require("../controller/home");

const router = Router();

router.get("/", getTest);

module.exports = router;
