var express = require("express");
var router = express.Router({mergeParams: true});
var Log = require("../models/log");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    Log.findById(req.params.id, function(err, log){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {log: log});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    Log.findById(req.params.id, function(err, log){
        if(err){
            console.log(err);
            res.redirect("/logs");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    log.comments.push(comment);
                    log.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/logs/"+ log._id);
                }
            });
        }
    });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {log_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENTS UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment Updated");
            res.redirect("/logs/" + req.params.id);
        }
    });
});

// COMMENTS DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/logs/" + req.params.id);
        }
    });
});

module.exports = router;