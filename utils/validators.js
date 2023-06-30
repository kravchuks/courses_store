const { body } = require("express-validator");
const User = require("../models/user");

exports.registerValidators = [
  body("email").isEmail().withMessage("Enter correct email").custom(async (value, { req }) => {
    try {
      const user = await User.findOne({ email: value });
      if (user) {
        return Promise.reject("User with this email already exist");
      }
    } catch (e) {
      console.log(e);
    }
  }).normalizeEmail(),
  body("password", "Password must be at least 4 characters")
    .isLength({ min: 4, max: 56 })
    .isAlphanumeric()
    .trim(),
  body("confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords must be same");
    }
    return true;
  })
    .trim(),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .trim(),
];

exports.loginValidators = [
  body("email").isEmail().withMessage("Enter correct email").normalizeEmail(),
  body("password", "Password must be at least 4 characters")
    .isLength({ min: 4, max: 56 })
    .isAlphanumeric()
    .trim(),
];

exports.courseValidators = [
  body("title").isLength({ min: 3 }).withMessage("Title must be at least 3 characters").trim(),
  body("price").isNumeric().withMessage("Enter correct price"),
  body("img", "Enter correct url").isURL(),
];
