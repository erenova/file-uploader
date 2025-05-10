const prisma = require("../utils/db");

async function getSettings(req, res) {
  try {
    // Get user's shares
    const shares = await prisma.share.findMany({
      where: {
        createdById: req.user.id,
      },
      include: {
        file: true,
        folder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.render("settings", {
      user: req.user,
      shares: shares,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).render("error", {
      message: "Error loading settings",
      error: { status: 500 },
    });
  }
}

async function updateUserSettings(req, res) {
  try {
    const { email } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
}

module.exports = {
  getSettings,
  updateUserSettings,
};
