require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { blacklistToken } = require('../middleware/jwtMiddleware');

// Log in Post
exports.log_in_post = (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: "Wrong username or password" });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }
                const token = jwt.sign({ user }, process.env.jwtSecret);

                return res.status(200).json({ message: "Login successful", token });
            });
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
};

//Post new user form
exports.sign_up_post = [
    body("firstname", "First Name should be entered").trim().isLength({ min:2 }).escape(),
    body("surname", "Surname should  be entered").trim().isLength({ min:2 }).escape(),
    body("username", "Please enter a Username").trim().isLength({ min:2 }).escape(),
    body("email", "Please enter an Email").trim().isLength({ min:2 }).escape(),
    body("password", "Please enter a Password").isLength({ min:8 }).escape(),
    body("confirm_password", "Please confirm your Password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userExists = await User.findOne({ username: req.body.username }).collation({ locale: "en", strength: 2 }).exec();
            if (userExists) {
                return res.status(400).json({ errors: [{ msg: "Username already exists" }] });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = new User({
                firstname: req.body.firstname,
                surname: req.body.surname,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            });

            await user.save();
            res.status(201).json({ message: "User created successfully" });
        } catch (err) {
            return next(err);
        }
    })
];

// Log out
exports.log_out = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    blacklistToken(token);

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});
