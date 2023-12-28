const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./database/config/connection");
const userRoutes = require("./routes/userRoutes");
const desireRoutes = require("./routes/desireRoutes");

dotenv.config();

// Add middlewares
app.use(cors());  // Enable CORS for the frontend
app.use(cookieParser());
app.use(bodyParser.json()); // Parse request body to JSON format

connectDB(); // Call connection to the database here 

// Default route
app.get('/', (req, res) => {
    res.send("Application is working correctly!");
});

// Use express middleware in this main file to call APIs
app.use("/users", userRoutes);
app.use("/desire", desireRoutes);

module.exports = app;