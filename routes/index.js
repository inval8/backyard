var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Log = require("../models/log");

//Root Route
router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle signup logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });
    if(req.body.adminCode === "jolly"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/logs");
        });
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

//handle login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/logs",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "logged you out");
    res.redirect("/logs");
});

module.exports = router;