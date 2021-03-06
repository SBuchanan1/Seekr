const express = require("express");
const router = express.Router();
const db = require("../models");
const passport = require("../config/passport");

// Requiring our custom middleware for checking if a user is logged in TODO: could probbably delete here sinces its not being used
const isAuthenticated = require("../config/middleware/isAuthenticated");

//========================VIEW ROUTES============================
router.get("/signup", (req, res) => {
    if(req.user) {
        res.redirect("/");
    }
    res.render("signup", {style: "signup.css"});
});

router.get("/login", (req, res) => {
    if(req.user) {
        res.redirect("/");
    }
    res.render("login", {style: "login.css"});
})


//========================API ROUTES==============================
// Returns all users TODO: WILL PROBABLY NEED TO REMOVE FOR SECURITY PURPOSES
router.get("/api/users", (req, res) => {
    db.User.findAll().then(dbUser => res.json(dbUser));
});

// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the members page.
// Otherwise the user will be sent an error
router.post("/api/login", passport.authenticate("local"), function(req, res) {
    res.json(req.user);
});

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.post("/api/signup", (req, res) => {
    db.User.create(req.body).then(() => {
        res.redirect(307, "/api/login");
    }).catch(err => {
        res.status(401).json(err);
    });
});

// Route for logging user out
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// Route for getting some data about our user to be used client side
router.get("/api/user_data", function(req, res) {
    if (!req.user) {
        // The user is not logged in, send back an empty object
        res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        id: req.user.id
      });
    }
  });


module.exports = router;