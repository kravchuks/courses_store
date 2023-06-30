const { Router } = require("express"); //import Router from express
const Course = require("../models/course"); //import Course model
const auth = require("../middleware/auth"); //import middleware for auth

const router = Router(); //create Router

function isOwner(course, req) {
  //function for check owner
  return course.userId.toString() === req.user._id.toString(); //return true or false
}

router.get("/", async (req, res) => {
  try {
    //route for courses page (GET request)
    const courses = await Course.find()
      .populate("userId", "email name")
      .select("price title img"); //get all courses from db
    res.render("courses", {
      //render courses.hbs
      title: "Courses list", //title for page
      isCourses: true, //variable for hbs
      userId: req.user ? req.user._id.toString() : null, //get user id
      courses, //courses which we get from db and send to hbs
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/remove", auth, async (req, res) => {
  //route for remove course (POST request)
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id }); //delete course from db
    res.redirect("/courses"); //redirect to courses page
  } catch (e) {
    console.log(e); //if error
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  //route for edit course page (GET request)
  if (!req.query.allow) {
    //if query param allow is not exist
    return res.redirect("/"); //redirect to home page
  }
  try {
    const course = await Course.findById(req.params.id); //get course by id from db
    if (!isOwner(course, req)) {
      //if user is not owner
      return res.redirect("/courses"); //redirect to courses page
    }

    res.render("course-edit", {
      //render course-edit.hbs
      title: `Edit ${course.title}`, //title for page
      course, //course which we get from db and send to hbs
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/edit", auth, async (req, res) => {
  //route for edit course (POST request)
  try {
    const { id } = req.body; //get id from req.body
    delete req.body.id; //delete id from req.body
    const course = await Course.findById(id); //get course by id from db
    if (!isOwner(course, req)) {
      //if user is not owner
      return res.redirect("/courses"); //redirect to courses page
    }
    Object.assign(course, req.body); //update course
    await course.save(); //save course in db
    res.redirect("/courses"); //redirect to courses page
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  //route for course page by id (GET request)
  try {
    const course = await Course.findById(req.params.id); //get course by id from db
    res.render("course", {
      //render course.hbs
      layout: "empty", //use empty layout
      title: `Course ${course.title}`, //title for page
      course, //course which we get from db and send to hbs
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
