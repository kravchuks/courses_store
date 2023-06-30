const { Router } = require("express"); //import Router from express
const { validationResult } = require("express-validator"); //import validationResult from express-validator
const Course = require("../models/course"); //import Course model
const auth = require("../middleware/auth"); //import middleware for auth
const { courseValidators } = require("../utils/validators"); //import validators

const router = Router(); //create Router

router.get("/", auth, (req, res) => { //route for home page (GET request)
  res.render("add", { 
    title: "Add course", //title for page
    isAdd: true, //variable for hbs
  });
});

router.post("/", auth, courseValidators, async (req, res) => { //route for home page (POST request)

  const errors = validationResult(req); //get errors from express-validator
  if (!errors.isEmpty()) { //if errors exist
    return res.status(422).render("add", { //render add.hbs
      title: "Add course", //title for page
      isAdd: true, //variable for hbs
      error: errors.array()[0].msg, //get error message
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
      },
    });
  }
  
  const course = new Course({ //create new course
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user, //add user who create course
  });
  try {
    await course.save(); //save course
    res.redirect("/courses"); //redirect to courses page
  } catch (e) {
    console.log(e); //if error
  }
});

module.exports = router;
