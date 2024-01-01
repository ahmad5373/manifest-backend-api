const mongoose = require("mongoose");
const Desire = require("../database/models/Desire");
const Logs = require("../database/models/Logs");

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

        const desireCreationTime = newDesire.createdAt;
        const newLog = await Logs.create({
            desireId: newDesire._id,
            userId: userId,
            streak: desireCreationTime,
            lastRunDate: desireCreationTime, // Set lastRunDate to the creation date
        });

        console.log(newLog);
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

// Get all Desires
exports.getAllDesires = async (req, res) => {
    try {
        // Fetch all desires from the database
        const allDesires = await Desire.find();
        const responseArray = [];
        // Loop through each desire
        for (const desire of allDesires) {
            // Fetch logs for the specified desire and sort them by lastRunDate in ascending order
            const logs = await Logs.find({ desireId: desire._id }).sort({ lastRunDate: 1 }).exec();

            // Calculate streak
            let streak = 0;
            for (let i = logs.length - 1; i > 0; i--) {
                const currentDate = new Date(logs[i].lastRunDate);
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
            }

            // Check if the streak includes the current date
            const lastLogDateStr = logs.length > 0 ? new Date(logs[logs.length - 1].lastRunDate).toISOString().split('T')[0] : null;
            if (lastLogDateStr === new Date().toISOString().split('T')[0]) {
                streak++;
            }

            const respData = {
                _id: desire._id,
                title: desire.title,
                userId: desire.userId,
                Count: logs.reduce((acc, log) => acc + log.runCount, 0),
                streak: streak,
                createdAt: desire.createdAt,
                updatedAt: desire.updatedAt,
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


// Get Desire with desire Id
exports.getDesireById = async (req, res) => {
    try {
        const desireId = req.params._id;
        if (!validateObjectId(desireId, res)) return;

        const desire = await Desire.findById(desireId);
        if (!desire) {
            return res.status(404).json({ error: "Desire not found" });
        }
        // Fetch logs for the specified desire and sort them by lastRunDate in ascending order
        const logs = await Logs.find({ desireId }).sort({ lastRunDate: 1 }).exec();

        // Calculate streak
        let streak = 0;
        for (let i = logs.length - 1; i > 0; i--) {
            let currentDate = new Date(); // Current date

            // Simulate going back to the previous date for each iteration
            currentDate.setDate(currentDate.getDate() - (logs.length - 1 - i));

            const prevDate = new Date(logs[i - 1].lastRunDate);

            // Set hours, minutes, seconds, and milliseconds to 0 for accurate date comparison
            const currentDayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
            const prevDayStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 0, 0, 0, 0);

            // Compare the dates directly
            if (currentDayStart.getTime() === prevDayStart.getTime()) {
                streak++;
            } else {
                break; // Streak is broken
            }

            currentDate.setDate(currentDate.getDate() - 1);
        }


        // Check if the streak includes the current date
        const lastLogDateStr = logs.length > 0 ? new Date(logs[logs.length - 1].lastRunDate).toISOString().split('T')[0] : null;
        if (lastLogDateStr === new Date().toISOString().split('T')[0]) {
            streak++;
        }

        const respData = {
            _id: desire._id,
            title: desire.title,
            userId: desire.userId,
            Count: logs.reduce((acc, log) => acc + log.runCount, 0),
            streak: streak,
            createdAt: desire.createdAt,
            updatedAt: desire.updatedAt,
        };

        res.status(200).json(respData);
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


exports.runLogs = async (req, res) => {
    try {
        const { desireId, userId } = req.body;
        // If the log entry doesn't exist, create a new one
        const newLog = await Logs.create({
            desireId: desireId,
            userId: userId,
            streak: new Date(),
            lastRunDate: new Date(),
            runCount: 1,
        });

        res.status(200).json({ Message: "Desire Run Successfully." });
    } catch (error) {
        console.log("Error While running Desire", error.message);
        res.status(500).json({ error: error.message });
    }
};
