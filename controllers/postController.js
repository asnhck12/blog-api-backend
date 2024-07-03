const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
require('dotenv').config();
const jwt = require('jsonwebtoken');

// View auth posts
exports.post_get = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user.user._id;
        const allPosts = await Post.find({ username: userId }).populate('username', 'username').sort({ timeStamp: -1 }).exec();
        res.json(allPosts);
    } catch (error) {
        next(error);
    }
});

// View all posts
exports.post_get_all = asyncHandler(async (req, res, next) => {
    try {
        const allPosts = await Post.find({published: true}).populate('username', 'username').sort({ timeStamp: -1 }).exec();
        res.json(allPosts);
    } catch (error) {
        next(error);
    }
});


// View post in full
exports.post_detail = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.id;
        // const userId = req.user.user._id;
        // const post = await Post.findById(postId).populate('username', 'username').exec();
        const post = await Post.findById(postId).populate('username', 'username').exec();
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (error) {
        next(error);
    }
});

// Post new blog
exports.post_create_send = [
    body("title", "Please enter a title more than 3 letters").trim().isLength({ min: 3 }).escape(),
    body("post", "Please enter a post more than 3 letters").trim().isLength({ min: 3 }).escape(),
    body("published").isBoolean().withMessage("Published must be a boolean"),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        jwt.verify(req.token, process.env.jwtSecret, async (err, authData) => {

            if (err) {
                return res.sendStatus(403); // Forbidden
            }

        const post = new Post({
            title: req.body.title,
            post: req.body.post,
            timeStamp: new Date(),
            published: req.body.published,
            username: req.user.user._id,
        });

        try{
            const savedPost = await post.save();
            res.status(201).json(savedPost);
        } catch (error) {
            next(error);
        }
    })
})
];

exports.post_update = [
    body("title", "Please enter a title more than 3 letters").trim().isLength({ min: 3 }).escape(),
    body("post", "Please enter a post more than 3 letters").trim().isLength({ min: 3 }).escape(),
    body("published").isBoolean().withMessage("Published must be a boolean"),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        jwt.verify(req.token, process.env.jwtSecret, async (err, authData) => {

            if (err) {
                return res.sendStatus(403); // Forbidden
            }

        const post = new Post({
            _id: req.params.id,
            title: req.body.title,
            post: req.body.post,
            timeStamp: new Date(),
            published: req.body.published,
            username: req.user.user._id,
        });

        try{
            await Post.findByIdAndUpdate(req.params.id, post);
            res.redirect(post.url);
        } catch (error) {
            next(error);
        }
    })
})
];

// Delete post
exports.post_delete = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});
