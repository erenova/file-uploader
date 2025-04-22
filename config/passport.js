const passport = require("passport");
const prisma = require("../utils/db");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      // const match = await bcrypt.compare(password, user.password);
      console.log(password);
      console.log(user);
      if (password !== user.password) {
        console.log("err pasword rong");
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
