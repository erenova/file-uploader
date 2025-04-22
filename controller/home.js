const prisma = require("../utils/db");

async function getHome(req, res) {
  try {
    const test = await prisma.user.findMany();
    console.log(test);
    res.render("home");
  } catch (err) {
    console.error("Error creating test record:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getHome,
};
