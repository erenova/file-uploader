const { body, validationResult } = require("express-validator");
const prisma = require("../utils/db");
const passport = require("../config/passport");

const bcrypt = require("bcryptjs");
const validateRegister = [
  body("email")
    .isEmail()
    .withMessage(`Please enter a valid email address.`)
    .custom(async (email) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("Email is already in use.");
      }
    }),

  body("password")
    .ltrim()
    .rtrim()
    .isLength({ min: 8 })
    .withMessage(`Password must be at least 8 characters.`),
  body("passwordCheck")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

const validateLogin = [
  body("email").isEmail().withMessage("Enter a valid email."),
  body("password").notEmpty().withMessage("Password is required."),
];

function getRegister(req, res) {
  res.render("register", {
    errors: req.errors,
  });
}

function getLogin(req, res) {
  const error = req.query.error;
  res.render("login", {
    error,
  });
}

async function postRegister(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("register", {
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return res.redirect("/auth/login");
  } catch (error) {
    return next(error);
  }
}

async function postLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("login", {
      errors: errors.array(),
      oldInput: req.body,
    });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).render("login", {
        errors: [{ msg: info.message }],
        oldInput: req.body,
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
}

function getLogout(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

module.exports = {
  validateRegister,
  validateLogin,
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  getLogout,
};
