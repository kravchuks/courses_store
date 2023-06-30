const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  password: {
    type: String,
    require: true,
  },
  avatarUrl: String,
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        count: {
          type: Number,
          require: true,
          default: 1,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          require: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (course) {
  const items = [...this.cart.items]; //copy items from cart
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === course._id.toString(); //find course in cart
  });
  if (idx >= 0) {
    //if course exist in cart
    items[idx].count = items[idx].count + 1; //increase count
  } else {
    //if course not exist in cart
    items.push({
      //add course to cart
      courseId: course._id,
      count: 1,
    });
  }
  this.cart = { items }; //update cart
  // another way
  // this.cart.items = items;
  return this.save(); //save cart in db
};

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items]; //copy items from cart
  const idx = items.findIndex((c) => c.courseId.toString() === id.toString()); //find course in cart
  if (items[idx].count === 1) {
    //if count of course is 1
    items = items.filter((c) => c.courseId.toString() !== id.toString()); //remove course from cart
  } else {
    //if count of course more than 1
    items[idx].count--; //decrease count
  }
  this.cart = { items }; //update cart
  // another way
  // this.cart.items = items;

  return this.save(); //save cart in db
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] }; //clear cart
  return this.save(); //save cart in db
};

module.exports = model("User", userSchema);
