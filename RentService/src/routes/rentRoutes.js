const express = require("express");
const rentController = require("../controllers/rentController");
const multer = require("multer");
const authorization = require("../middleware/authorization");
const role = require("../models/roles");

const router = express.Router();

router.post("/start/:id", authorization.authorize([role.User, role.Manager]), rentController.startRental);
router.post("/stop/:id", authorization.authorize([role.User, role.Manager]), rentController.stopRental);
router.get("/getClosestVehicle/:lat/:long", authorization.authorize([role.User, role.Manager]), rentController.getClosestAvailableVehicle);
router.get("/getRentsByUsername/:username", authorization.authorize([role.User, role.Manager]), rentController.getRentsByUsername);
router.get("/getClosestPath/:lat/:long/:id", authorization.authorize([role.User, role.Manager]), rentController.getClosestPathToVehicle);

module.exports = router;
