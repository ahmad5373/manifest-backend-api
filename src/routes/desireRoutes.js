const express = require("express");
const router = express.Router();
const desireController  = require("../controllers/desireController");

//Desire Routes

router.post("/create" , desireController.createDesire);
router.get("/:_id" , desireController.getDesireById);
router.put("/:_id", desireController.update);
router.delete("/:_id", desireController.delete);

module.exports = router