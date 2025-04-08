const prisma = require("../utils/db");

async function getTest(req, res) {
  try {
    const test = await prisma.test.findMany();
    console.log(test);
    res.send(test);
  } catch (err) {
    console.error("Error creating test record:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getTest,
};
