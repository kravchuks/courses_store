const { Schema, model } = require("mongoose"); //import mongoose

const course = new Schema({
  //create schema for course
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

course.method("toClient", function () {
  //method for convert data to client
  const course = this.toObject(); //get course
  course.id = course._id; //add id to course
  delete course._id; //delete _id from course
  return course; //return course
});

module.exports = model("Course", course); //export model for course
