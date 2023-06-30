const { Router } = require("express"); //import Router from express
const bcrypt = require("bcryptjs"); //import bcryptjs
const nodemailer = require("nodemailer"); //import nodemailer
const sendgrid = require("nodemailer-sendgrid-transport"); //import nodemailer-sendgrid-transport
const crypto = require("crypto"); //import crypto
const { body, validationResult } = require("express-validator"); //import express-validator
const User = require("../models/user"); //import User model
const keys = require("../keys"); //import keys
const regEmail = require("../emails/registration"); //import registration email
const resetEmail = require("../emails/reset"); //import reset email
const { registerValidators, loginValidators } = require("../utils/validators"); //import validators

const router = Router(); //create Router

const transporter = nodemailer.createTransport(
  sendgrid({
    //create transporter for sendgrid
    auth: { api_key: keys.SENDGRID_API_KEY }, //api key for sendgrid
  })
);

router.get("/login", (req, res) => {
  //route for login page (GET request)
  res.render("auth/login", {
    //render login page
    title: "Authorization",
    isLogin: true,
    loginError: req.flash("loginError"), //get flash message
    registerError: req.flash("registerError"), //get flash message
  });
});

router.get("/logout", (req, res) => {
  //route for logout page (GET request)
  req.session.destroy(() => {
    //destroy session(destroy cookie)
    res.redirect("/auth/login#login"); //redirect to login page
  });
});

router.post("/login", loginValidators, async (req, res) => {
  //route for login page (POST request)
  try {
    const { email, password } = req.body; //get data from form
    const candidate = await User.findOne({ email }); //find user in db

    const errors = validationResult(req); //get errors from express-validator
    if (!errors.isEmpty()) {
      //if errors exist
      req.flash("loginError", errors.array()[0].msg); //create flash message
      return res.status(422).redirect("/auth/login#login"); //redirect to login page
    }

    if (candidate) {
      //if user exist
      const areSame = await bcrypt.compare(password, candidate.password); //compare passwords
      if (areSame) {
        //if passwords are same

        req.session.user = candidate; //create session
        req.session.isAuthenticated = true; //set auth flag
        req.session.save((err) => {
          //save session
          if (err) {
            throw err;
          }
          res.redirect("/"); //redirect to home page
        });
      } else {
        //if passwords are not same
        req.flash("loginError", "Wrong password"); //create flash message
        res.redirect("/auth/login#login"); //redirect to login page
      }
    } else {
      //if user not exist
      req.flash("loginError", "User with this email not found"); //create flash message
      res.redirect("/auth/login#login"); //redirect to login page
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  //route for register page (POST request)
  try {
    const { email, password, name } = req.body; //get data from form

    const errors = validationResult(req); //get errors from express-validator
    if (!errors.isEmpty()) {
      //if errors exist
      req.flash("registerError", errors.array()[0].msg); //create flash message
      return res.status(422).redirect("/auth/login#register"); //redirect to register page
    }

    const hashPassword = await bcrypt.hash(password, 10); //hash password
    const user = new User({
      //create new user
      email,
      name,
      password: hashPassword,
      cart: { items: [] }, //create empty cart
    });
    await user.save(); //save user in db
    await transporter.sendMail(regEmail(email)); //send email
    res.redirect("/auth/login#login"); //redirect to login page
  } catch (e) {
    console.log(e);
  }
});

router.get("/reset", (req, res) => {
  //route for reset page (GET request)
  res.render("auth/reset", {
    //render reset page
    title: "Reset password",
    error: req.flash("error"), //get flash message
  });
});

router.get("/password/:token", async (req, res) => {
  //route for password page (GET request)
  if (!req.params.token) {
    //if token not exist
    return res.redirect("/auth/login"); //redirect to login page
  }
  try {
    const user = await User.findOne({
      //find user in db
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }, //check token expiration time
    });
    if (!user) {
      //if user not exist
      return res.redirect("/auth/login"); //redirect to login page
    } else {
      //if user exist
      res.render("auth/password", {
        //render password page
        title: "Reset password",
        error: req.flash("error"), //get flash message
        userId: user._id.toString(), //get user id
        token: req.params.token, //get token
      });
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/reset", (req, res) => {
  //route for reset page (POST request)
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      //create random token
      if (err) {
        //if error
        req.flash("error", "Something went wrong, try again later"); //create flash message
        return res.redirect("/auth/reset"); //redirect to reset page
      } else {
        //if no error
        const token = buffer.toString("hex"); //create token

        const candidate = await User.findOne({ email: req.body.email }); //find user in db

        if (candidate) {
          //if user exist
          candidate.resetToken = token; //set token
          candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; //set token expiration time
          await candidate.save(); //save user in db
          await transporter.sendMail(resetEmail(candidate.email, token)); //send email
          res.redirect("/auth/login"); //redirect to login page
        } else {
          //if user not exist
          req.flash("error", "User with this email not found"); //create flash message
          res.redirect("/auth/reset"); //redirect to reset page
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/password", async (req, res) => {
  //route for password page (POST request)
  try {
    const user = await User.findOne({
      //find user in db
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() }, //check token expiration time
    });
    if (user) {
      //if user exist
      user.password = await bcrypt.hash(req.body.password, 10); //hash password
      user.resetToken = undefined; //delete token
      user.resetTokenExp = undefined; //delete token expiration time
      await user.save(); //save user in db
      res.redirect("/auth/login"); //redirect to login page
    } else {
      //if user not exist
      req.flash("loginError", "Token expired"); //create flash message
      res.redirect("/auth/login"); //redirect to login page
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router; //export Router
