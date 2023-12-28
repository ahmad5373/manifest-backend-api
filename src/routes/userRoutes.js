const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Middleware to validate user input
const validateUser = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    // Email validation for correct email format ("foobar@gmail.com")
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format. Please provide a valid email" });
    }
    next();
};

// User Routes
router.post("/signup", validateUser, userController.signup);
router.post("/login", validateUser, userController.login);
router.get("/", userController.getAllUser);
router.get("/:_id", userController.getUserById);
router.put("/:_id", userController.update);
router.post("/forgot-password", userController.forgetPassword);
router.post("/reset-password", userController.resetPassword);
router.put("/change-password/:_id", userController.changePassword);
router.delete("/:_id", userController.delete);

//Desire Routes
router.get("/user-desire/:_id",userController.userDesire); // get all desire of user by id

module.exports = router;
