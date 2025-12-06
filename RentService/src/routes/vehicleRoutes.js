const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const authorization = require("../middleware/authorization");
const role = require("../models/roles");
const router = express.Router();

router.get("/getAllVehicles", authorization.authorize([role.Manager]), vehicleController.getAllVehicles);
router.get("/getVehicleById/:id", authorization.authorize([role.Manager]), vehicleController.getVehicleById);
router.get("/getAllVehiclesTypes", authorization.authorize([role.Manager]), vehicleController.getAllVehiclesTypes);
router.get("/getVehicleTypeById/:id", authorization.authorize([role.Manager]), vehicleController.getVehicleTypeById);
router.put("/updateVehicle/:id", authorization.authorize([role.Manager]), vehicleController.updateVehicle);
router.put("/updateVehicleType/:id", authorization.authorize([role.Manager]), vehicleController.updateVehicleType);
router.post("/createVehicle", authorization.authorize([role.Manager]), vehicleController.createVehicle);
router.post("/createVehicleType", authorization.authorize([role.Manager]), vehicleController.createVehicleType);

router.get("/getVehicleDetails/:id", authorization.authorize([role.User, role.Manager]), vehicleController.getVehicleDetailsById);
router.get("/getAllAvailableVehicles", authorization.authorize([role.User, role.Manager]), vehicleController.getAvailableVehiclesDetails);

module.exports = router;
