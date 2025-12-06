"use strict";
module.exports = function (app) {
     const vehicleLocationController = require("../controller/vehicleLocationController");

     app.route("/vehicleLocation").get((req, res) => vehicleLocationController.getAll(req, res));

     app.route("/vehicleLocation/getAllLatestLocation").get((req, res) => vehicleLocationController.getAllLatest(req, res));

     app.route("/vehicleLocation/:id").get((req, res) => vehicleLocationController.getById(req, res));

     app.route("/vehicleLocation/getLatestLocation/:id").get((req, res) => vehicleLocationController.getLatest(req, res));

     app.route("/vehicleLocation/:id/:start").get((req, res) => vehicleLocationController.startOrStopLocation(req, res));
};
