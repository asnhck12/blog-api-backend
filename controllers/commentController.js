const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");
const Post = require("../models/post")

// View comments
exports.comment_get = asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // const filter = { post:postId };
    // postId ? { post: postId } : {};
    
    try {
        const allComments = await Comment.find({ post: postId}).sort({ timeStamp: -1 }).exec();
        res.json(allComments);
    } catch (error) {
        console.error("Error fetching comments:", error); 
        next(error);
    }
});

// Comment new submission
exports.comment_create_send = [
    body("name", "Please enter a name more than 3 letters").trim().isLength({ min: 3 }).escape(),
    body("comment", "Please enter a comment more than 3 letters").trim().isLength({ min: 3 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const comment = new Comment({
            name: req.body.name,
            comment: req.body.comment,
            timeStamp: new Date(),
            post: req.body.post
        });

        try {
            await comment.save();
            res.status(201).json(comment);
        } catch (error) {
            next(error);
        }
    })
];

// Delete comment
exports.comment_delete = asyncHandler(async (req, res, next) => {
    try {
        const {commentId} = req.params;
        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});