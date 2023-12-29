const express = require("express");
const router = express.Router();
const desireController  = require("../controllers/desireController");

//Desire Routes

router.post("/create" , desireController.createDesire);
router.get("/" , desireController.getAllDesires);
router.get("/:_id" , desireController.getDesireById);
router.put("/:_id", desireController.update);
router.delete("/:_id", desireController.delete);

router.post("/run-manifest", desireController.runLogs); // run logs routes


module.exports = router