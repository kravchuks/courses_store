module.exports = function (req, res, next) {
  //middleware for auth
  if (!req.session.isAuthenticated) {
    //if user not authenticated
    return res.redirect("/auth/login#login"); //redirect to login page
  }
  next(); //next middleware
};
