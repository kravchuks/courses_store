const { Router } = require("express"); //import Router from express
const Order = require("../models/order"); //import Order model
const auth = require("../middleware/auth"); //import middleware for auth

const router = Router(); //create Router

router.get("/", auth, async (req, res) => {
  //route for orders page (GET request)
  try {
    const orders = await Order.find({ "user.userId": req.user._id }) //get orders from db
      .populate("user.userId"); //get user from order

    res.render("orders", {
      //render orders page
      isOrder: true,
      title: "Orders",
      orders: orders.map((o) => ({
        ...o._doc, //get all fields from order
        price: o.courses.reduce((total, c) => {
          //calculate total price
          return (total += c.count * c.course.price);
        }, 0),
      })),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/", auth, async (req, res) => {
  //route for orders page (POST request)
  try {
    const user = await req.user //get user from request
      .populate("cart.items.courseId"); //get courses from cart

    const courses = user.cart.items.map((i) => ({
      //map courses in cart
      count: i.count,
      course: { ...i.courseId._doc }, //get all fields from course
    }));

    const order = new Order({
      //create new order
      user: {
        name: req.user.name,
        userId: req.user, //get user id
      },
      courses: courses,
    });

    await order.save(); //save order in db
    await req.user.clearCart(); //clear cart

    res.redirect("/orders"); //redirect to orders page
  } catch (e) {
    console.log(e);
  }
});

module.exports = router; //export Router
