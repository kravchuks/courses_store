const { Router } = require("express"); //import Router from express

const router = Router(); //create Router

router.get("/", (req, res) => { //route for home page
  res.render("index", { //render index.hbs
    title: "Home page", //title for page
    isHome: true, //variable for hbs
  });
});

module.exports = router; //export router
