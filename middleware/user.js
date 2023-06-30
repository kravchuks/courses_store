const User = require("../models/user"); //import User model

module.exports = async function (req, res, next) {
  if (!req.session.user) {
    return next();
  }

  req.user = await User.findById(req.session.user._id); //get user from db
  next();
};
