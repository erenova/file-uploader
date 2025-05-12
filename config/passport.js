const passport = require("passport");
const prisma = require("../utils/db");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("Attempting login for email:", email);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log("No user found with email:", email);
          return done(null, false, {
            message: "No account found with this email.",
          });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          console.log("Password mismatch for user:", email);
          return done(null, false, { message: "Incorrect password." });
        }

        console.log("Login successful for user:", email);
        return done(null, user);
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.log("User not found during deserialization:", id);
      return done(new Error("User not found"));
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
