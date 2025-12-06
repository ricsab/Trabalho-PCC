const express = require("express");
const vehicleLocationcontroller = require("../controllers/vehicleLocationController");
const authorization = require("../middleware/authorization");
const role = require("../models/roles");

const router = express.Router();

router.get("/getAll", authorization.authorize([role.Manager]), vehicleLocationcontroller.getAll);
router.get("/getById/:id", authorization.authorize([role.Manager]), vehicleLocationcontroller.getById);
router.get("/getLatestLocation/:id", authorization.authorize([role.Manager, role.User]), vehicleLocationcontroller.getLatestLocation);
router.get("/getAllLatestLocation", authorization.authorize([role.Manager, role.Manager.User]), vehicleLocationcontroller.getAllLatestLocation);
router.get("/startOrStopLocationGenerationByVehicle/:id/:start", authorization.authorize([role.Manager, role.User]), vehicleLocationcontroller.startOrStopLocationGenerationByVehicle);

module.exports = router;
