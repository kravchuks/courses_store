module.exports = function (req, res, next) {
  //middleware for variables
  res.locals.isAuth = req.session.isAuthenticated; //set isAuth variable
  res.locals.csrf = req.csrfToken(); //set csrf variable
  next(); //next middleware
}