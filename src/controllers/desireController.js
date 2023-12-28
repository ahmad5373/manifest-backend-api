const mongoose = require("mongoose");
const Desire = require("../database/models/Desire");

// Function to validate if an ID is a valid ObjectId
const validateObjectId = (id, res) => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid _id" });
        return false;
    }
    return true;
};

//Endpoint for create desire
exports.createDesire = async (req, res) => {
    try {
        const { title, userId } = req.body;
        const newDesire = await Desire.create({ title, userId });

        const desireData = {
            _id: newDesire._id,
            title: newDesire.title,
            userId,
        };

        res.status(201).json({ Message: "Desire Created Successfully", desireData });
    } catch (error) {
        console.log("Error While Creating Desired: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get Desire with desire Id
exports.getDesireById = async (req, res) => {
    try {
        const desireId = req.params._id;
        if (!validateObjectId(desireId, res)) return;

        const desire = await Desire.findById(desireId);
        if (!desire) {
            return res.status(404).json({ error: "Desire not found" });
        }

        res.status(200).json(desire);
    } catch (error) {
        console.log("Error While fetching desire:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Update Desire By Id
exports.update = async (req, res) => {
    try {
        const desireId = req.params._id;
        if (!validateObjectId(desireId, res)) return;

        const updatedDesire = await Desire.findByIdAndUpdate(desireId, req.body, { new: true });
        if (!updatedDesire) {
            return res.status(404).json({ error: "Desire not found " });
        }

        res.status(200).json({ success: "Update Desire Successfully." });
    } catch (error) {
        console.log("Error While Updating Desire:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const desireId = req.params._id;
        if (!validateObjectId(desireId, res)) return;

        const deletedDesire = await Desire.findByIdAndDelete(desireId);
        if (!deletedDesire) {
            return res.status(404).json({ error: "Desire not found." });
        }

        res.status(200).json({ Message: "Desire Deleted Successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
