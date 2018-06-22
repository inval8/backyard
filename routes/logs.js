var express = require("express");
var router = express.Router();
var Log = require("../models/log");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'bealvin', 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

//INDEX
router.get("/", function(req, res){
    Log.find({}, function(err, allLogs){
        if(err){
            console.log(err);
        } else {
            res.render("logs/index", {logs: allLogs, page: 'log'});
        }
    });
});

//CREATE
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.log.image = result.secure_url;
    // add author to campground
    req.body.log.author = {
    id: req.user._id,
    username: req.user.username
    };
    Log.create(req.body.log, function(err, log) {
    if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
    res.redirect('/logs/' + log.id);
    });
});
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("logs/new");
});

//SHOW
router.get("/:id", function(req, res){
    Log.findById(req.params.id).populate("comments").exec(function(err, foundLog){
        if(err){
            console.log(err);
        } else {
            console.log(foundLog);
            res.render("logs/show", {log: foundLog});
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkLogOwnership, function(req, res) {
    Log.findById(req.params.id, function(err, foundLog) {
        res.render("logs/edit", {log: foundLog});
    });
});

//UPDATE
router.put("/:id", middleware.checkLogOwnership, function(req, res){
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description};
    Log.findByIdAndUpdate(req.params.id, req.body.log, function(err, updatedLog){
        if(err){
            res.redirect("/logs");
        } else {
            res.redirect("/logs/" + req.params.id);
        }
    });
});

//DESTROY
router.delete("/:id", middleware.checkLogOwnership, function(req, res){
    Log.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/logs");
        } else {
            res.redirect("/logs");
        }
    });
});

module.exports = router;