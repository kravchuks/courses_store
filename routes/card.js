const { Router } = require("express"); //import Router from express
const Course = require("../models/course"); //import Course model
const auth = require("../middleware/auth"); //import middleware for auth

const router = Router(); //create Router

function mapCartItems(cart) {
  //function for map courses in cart
  return cart.items.map((c) => ({
    ...c.courseId._doc, //data without metadata
    id: c.courseId.id, //get id from course
    count: c.count, //get count from course
  }));
}

function computePrice(courses) {
  //function for calculate total price
  return courses.reduce((total, c) => {
    return (total += c.price * c.count); //calculate total price
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  //route for add course to card (POST request)
  const course = await Course.findById(req.body.id); //get course by id from db
  await req.user.addToCart(course); //add course to card
  res.redirect("/card"); //redirect to card page
});

router.delete("/remove/:id", auth, async (req, res) => {
  //route for remove course from card (DELETE request)
  await req.user.removeFromCart(req.params.id); //remove course from card
  const user = await req.user.populate("cart.items.courseId"); //get user from request
  const courses = mapCartItems(user.cart); //map courses in cart
  const cart = {
    courses,
    price: computePrice(courses), //calculate total price
  };
  res.status(200).json(cart); //send cart
});

router.get("/", auth, async (req, res) => {
  //route for card page (GET request)
  try {
    const user = await req.user //get user from request
      .populate("cart.items.courseId"); //get courses from cart

    const courses = mapCartItems(user.cart); //map courses in cart
    res.render("card", {
      //render card page
      title: "Card",
      isCard: true,
      courses: courses,
      price: computePrice(courses), //calculate total price
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
