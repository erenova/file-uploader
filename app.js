const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const path = require("node:path");
const home = require("./routes/home");
const prisma = require("./utils/db");
const passport = require("passport");
// Express Init
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS Config
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set Public Folder
app.use(express.static("public"));

// Session Setup
app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at mesa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

// Passport Auth
app.use(passport.session());

// Routers
app.use(home);

// Listener
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
