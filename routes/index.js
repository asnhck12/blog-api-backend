var express = require('express');
var router = express.Router();

const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");
const {verifyToken} = require("../middleware/jwtMiddleware");

// Login Submission
router.post('/login',user_controller.log_in_post);

// Sign up submission
router.post('/signup', user_controller.sign_up_post);

// Log out
router.post('/log_out', user_controller.log_out);

// GET Auth Posts 
router.get('/posts', verifyToken, post_controller.post_get);

//Get all Posts
router.get('/allposts', post_controller.post_get_all);

// GET single Post by ID  
router.get('/posts/:id', post_controller.post_detail);

//submit Posts
router.post('/posts/new_post', verifyToken, post_controller.post_create_send);

//Update Posts
router.post('/posts/:id/update', verifyToken, post_controller.post_update);

//Delete Posts
router.post('/posts/:id/delete', verifyToken, post_controller.post_delete);

// GET Comments 
router.get('/posts/:id/comments', comment_controller.comment_get);

//submit comments
router.post('/posts/:id/comments/new_comment', comment_controller.comment_create_send);

//Delete comments
router.post('/posts/:id/comments/:commentId/delete', verifyToken, comment_controller.comment_delete);

module.exports = router;
