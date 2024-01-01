const User = require("../database/models/User");
const Desire = require("../database/models/Desire");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../middleware/sendMail");
const dotenv = require("dotenv");
const Logs = require("../database/models/Logs");
dotenv.config();

// Function to hash a password using bcrypt
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Function to validate if an ID is a valid ObjectId
const validateObjectId = (id, res) => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid _id" });
        return false;
    }
    return true;
};

// User registration endpoint
exports.signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await hashPassword(password);
        user = new User({
            userName,
            email,
            password: hashedPassword,
            plan: "free"
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error while creating user:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// User login endpoint
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
            if (err) throw err;
            res.json({ token, user });
        });
    } catch (error) {
        console.error("Error while logging in:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to get all users
exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error while fetching users:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to get a user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!validateObjectId(userId, res)) return;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error while fetching user:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to update a user's information
exports.update = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!validateObjectId(userId, res)) return;
        const { userName, email, password } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ error: "Email is already taken" });
            }
            user.email = email;
        }
        if (password) {
            user.password = await hashPassword(password);
        }
        user.userName = userName || user.userName;
        await user.save();
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.log("Error while fetching user:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to change a user's password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!validateObjectId(userId, res)) return;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(userId);
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New password and confirm password do not match" });
        }
        user.password = await hashPassword(newPassword);
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log("Error while updating password:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to initiate the password reset process
exports.forgetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: "User Not Found" });
        }
        // const resetToken = crypto.randomBytes(20).toString('hex');
        const randomBytes = crypto.randomBytes(3);
        const code = parseInt(randomBytes.toString('hex'), 16) % 1000000;
        const sixDigitCode = code.toString().padStart(6, 0);
        user.resetPasswordCode = sixDigitCode;
        user.resetPasswordExpire = Date.now() + 3600000; // Token expires in one hour
        await user.save();
        const subject = "Password Reset Request";
        const html = `Please Provide these 6 Digit code to reset your password: ${sixDigitCode}`;
        await sendMail(user.email, subject, html);
        res.status(200).json({ message: "6 Digit code send to your email" });
    } catch (error) {
        console.error("Error while processing forgot password request:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to reset the user's password based on the provided token
exports.resetPassword = async (req, res) => {
    try {
        const { code, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({
            resetPasswordCode: code,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired Code" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New password and confirm password do not match" });
        }
        user.password = await hashPassword(newPassword);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log("Error while resetting password ", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to delete a user by ID
exports.delete = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!validateObjectId(userId, res)) return;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error while deleting user:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// Endpoint to get Desire by userId
exports.userDesire = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!validateObjectId(userId, res)) return;

        // Fetch all desires for the specified user
        const userDesires = await Desire.find({ userId: userId });

        // Create an array to store response data for each desire
        const responseArray = [];

        // Loop through each desire
        for (const userDesire of userDesires) {
            // Fetch logs for the specified desire and sort them by lastRunDate in ascending order
            const logs = await Logs.find({ desireId: userDesire._id }).sort({ lastRunDate: 1 }).exec();

            // Calculate streak
            let streak = 0;
            for (let i = logs.length - 1; i > 0; i--) {
                let currentDate = new Date(); // Current date
    
                // Simulate going back to the previous date for each iteration
                currentDate.setDate(currentDate.getDate() - (logs.length - 1 - i));
                const prevDate = new Date(logs[i - 1].lastRunDate);
    
                // Set hours, minutes, seconds, and milliseconds to 0 for accurate date comparison
                currentDate.setHours(0, 0, 0, 0);
                prevDate.setHours(0, 0, 0, 0);
    
                const diffTime = currentDate - prevDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
                if (diffDays === 1) {
                    streak++;
                } else if (diffDays > 1) {
                    break; // Streak is broken
                }
                currentDate.setDate(currentDate.getDate() - 1);
            }
            
            // Check if the streak includes the current date
            const lastLogDateStr = logs.length > 0 ? new Date(logs[logs.length - 1].lastRunDate).toISOString().split('T')[0] : null;
            const today = new Date();
            if (lastLogDateStr === today.toISOString().split('T')[0]) {
                streak++;
            }

            const respData = {
                _id: userDesire._id,
                title: userDesire.title,
                userId: userDesire.userId,
                Count: logs.reduce((acc, log) => acc + log.runCount, 0),
                streak: streak,
                createdAt: userDesire.createdAt,
                updatedAt: userDesire.updatedAt,
            };

            // Add response data to the array
            responseArray.push(respData);
        }

        res.status(200).json(responseArray);
    } catch (error) {
        console.log("Error While fetching desires:", error.message);
        res.status(500).json({ error: error.message });
    }
};
