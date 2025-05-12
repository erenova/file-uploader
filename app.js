require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const path = require("node:path");
const home = require("./routes/home");
const auth = require("./routes/auth");
const upload = require("./routes/upload");
const folder = require("./routes/folder");
const fileRoute = require("./routes/file");
const dashboard = require("./routes/dashboard");
const share = require("./routes/share");
const settings = require("./routes/settings");
const prisma = require("./utils/db");
const passport = require("./config/passport");
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
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

// Notification Middleware
app.use((req, res, next) => {
  res.locals.notification = req.session.notification;
  delete req.session.notification;
  next();
});

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());
// Routers
app.use(home);
app.use(auth);
app.use(dashboard);
app.use(upload);
app.use(folder);
app.use(fileRoute);
app.use("/share", share);
app.use(settings);
app.use("/share", require("./routes/share"));
app.use(require("./routes/settings"));

// 404 handler - must be after all other routes
app.use((req, res, next) => {
  res.status(404).render("404");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    message: "Something broke!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Listener
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
