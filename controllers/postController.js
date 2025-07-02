const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
require('dotenv').config();
const sanitizeHtml = require("sanitize-html");
const jwt = require('jsonwebtoken');

// Allowed HTML tags and attributes for sanitization
const sanitizeOptions = {
  allowedTags: [
    "p", "b", "i", "em", "strong", "u",
    "h1", "h2", "h3", "blockquote", "ul", "ol", "li", "br", "a"
  ],
  allowedAttributes: {
    a: ['href', 'target'],
    '*': ['style']
  },
  allowedSchemes: ['http', 'https', 'mailto']
};

// View auth posts
exports.post_get = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.user._id;
    const allPosts = await Post.find({ username: userId })
      .populate('username', 'username')
      .sort({ timeStamp: -1 })
      .exec();
    res.json(allPosts);
  } catch (error) {
    next(error);
  }
});

// View all published posts
exports.post_get_all = asyncHandler(async (req, res, next) => {
  try {
    const allPosts = await Post.find({ published: true })
      .populate('username', 'username')
      .sort({ timeStamp: -1 })
      .exec();
    res.json(allPosts);
  } catch (error) {
    next(error);
  }
});

// View post detail
exports.post_detail = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate('username', 'username')
      .exec();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Create new post
exports.post_create_send = [
  body("title", "Please enter a title more than 3 letters").trim().isLength({ min: 3 }),
  body("post", "Please enter a post more than 3 letters").trim().isLength({ min: 3 }),
  body("published").isBoolean().withMessage("Published must be a boolean"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    jwt.verify(req.token, process.env.jwtSecret, async (err, authData) => {
      if (err) {
        return res.sendStatus(403);
      }

      const sanitizedPost = sanitizeHtml(req.body.post, sanitizeOptions);

    
      const post = new Post({
        title: req.body.title,
        post: sanitizedPost,
        timeStamp: new Date(),
        published: req.body.published,
        username: req.user.user._id,
      });

      try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
      } catch (error) {
        next(error);
      }
    });
  })
];

// Update post
exports.post_update = [
  body("title", "Please enter a title more than 3 letters").trim().isLength({ min: 3 }),
  body("post", "Please enter a post more than 3 letters").trim().isLength({ min: 3 }),
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

      const sanitizedPost = sanitizeHtml(req.body.post, sanitizeOptions);

      const post = {
        title: req.body.title,
        post: sanitizedPost,
        timeStamp: new Date(),
        published: req.body.published,
        username: req.user.user._id,
      };

      try {
        await Post.findByIdAndUpdate(req.params.id, post);
        res.json({ message: "Post updated successfully" });
      } catch (error) {
        next(error);
      }
    });
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
