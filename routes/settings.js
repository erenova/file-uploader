const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const { body, validationResult } = require("express-validator");
const { getSettings, updateUserSettings } = require("../controller/settings");

const router = Router();

router.get("/settings", requireAuth, getSettings);

router.post(
  "/settings/update",
  requireAuth,
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    await updateUserSettings(req, res);
  },
);

module.exports = router;
