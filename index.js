const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const express = require("express"); //import express
const exphbs = require("express-handlebars"); //import express-handlebars
const session = require("express-session"); //import express-session
const MongoStore = require("connect-mongodb-session")(session); //import connect-mongodb-session
const path = require("path"); //module for working with paths
const mongoose = require("mongoose");
const csurf = require("csurf"); //import csurf
const helmet = require("helmet"); //import helmet
const compression = require("compression"); //import compression
const flash = require("connect-flash"); //import connect-flash

const homeRoutes = require("./routes/home"); //import routes for home
const coursesRoutes = require("./routes/courses"); //import routes for courses
const addRoutes = require("./routes/add"); //import routes for add courses
const cardRoutes = require("./routes/card"); //import routes for card
const ordersRoutes = require("./routes/orders"); //import routes for orders
const authRoutes = require("./routes/auth"); //import routes for auth
const profileRoutes = require("./routes/profile"); //import routes for profile
const varMiddleware = require("./middleware/variables"); //import middleware for variables
const userMiddleware = require("./middleware/user"); //import middleware for user
const errorHandler = require("./middleware/error"); //import middleware for error
const fileMiddleware = require("./middleware/file"); //import middleware for file
const keys = require("./keys"); //import keys

const app = express(); //create express app

const hbs = exphbs.create({
  //create handlebars
  defaultLayout: "main", //main layout for all pages
  extname: "hbs", //extension for files
  handlebars: allowInsecurePrototypeAccess(Handlebars), //allow prototype access
  helpers: require("./utils/hbs-helpers"), //helpers for handlebars
});
const store = new MongoStore({
  //create store for session
  collection: "sessions", //collection for sessions
  uri: keys.MONGODB_URI, //url for connect to database
});

app.engine("hbs", hbs.engine); //register handlebars in express
app.set("view engine", "hbs"); //set handlebars as view engine
app.set("views", "views"); //set folder for views

app.use(express.static(path.join(__dirname, "public"))); //set folder for static files
app.use('/images', express.static(path.join(__dirname, 'images'))); //set folder for images
app.use(express.urlencoded({ extended: true })); //middleware for parsing urlencoded data from forms (for POST requests)
app.use(
  session({
    //middleware for session
    secret: keys.SECRET_VALUE, //secret key
    resave: false, //don't save session if unmodified
    saveUninitialized: false, //don't create session until something stored
    store: store, //store for session
  })
);
app.use(fileMiddleware.single("avatar")); //middleware for file
app.use(csurf()); //middleware for csrf
app.use(flash()); //middleware for flash messages
// app.use(helmet()); //middleware for helmet (security)
app.use(compression()); //middleware for compression (gzip)
app.use(varMiddleware); //middleware for variables
app.use(userMiddleware); //middleware for user

app.use("/", homeRoutes); //routes for home
app.use("/courses", coursesRoutes); //routes for courses
app.use("/add", addRoutes); //routes for add courses
app.use("/card", cardRoutes); //routes for card
app.use("/orders", ordersRoutes); //routes for orders
app.use("/auth", authRoutes); //routes for auth
app.use("/profile", profileRoutes); //routes for profile

app.use(errorHandler); //middleware for error

const PORT = process.env.PORT || 3000; //port for server

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      //connect to database
      useNewUrlParser: true,
    });
    app.listen(PORT, () => {
      //start server
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (e) {
    console.log(e); //if error
  }
}

start();
