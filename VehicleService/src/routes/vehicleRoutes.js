"use strict";
module.exports = function (app) {
     const vehicleTypeController = require("../controller/vehicleTypeController");
     const vehicleController = require("../controller/vehicleController");

     app.route("/vehicle")
          .get(vehicleController.getAll) //Get all vehicles
          .post(vehicleController.createVehicle); //add vehicle

     app.route("/vehicle/:id")
          .get(vehicleController.getById) //Get vehicle
          .put(vehicleController.updateVehicle); //Update vehicle Information

     app.route("/vehicleType")
          .get(vehicleTypeController.getAll) //Get all vehicles types
          .post(vehicleTypeController.create); //Add vehicle type

     app.route("/vehicleType/:id")
          .get(vehicleTypeController.getById) //Get vehicle type
          .put(vehicleTypeController.update); //Update vehicle type Information

     app.route("/vehicleDetails/:id").get(vehicleController.getDetails);

     app.route("/vehicleAvailableDetails").get(vehicleController.getAllAvailableDetails);
};
