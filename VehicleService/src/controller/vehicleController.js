const vehicleTypeController = require("./vehicleTypeController");
const vehicle = require("../models/vehicleModel");

exports.getAll = async function (req, res) {
     try {
          var vehicles = await vehicle.find();

          if (vehicles) {
               return res.status(200).json(vehicles);
          }

          return res.status(400).json({ error: "Request bad formated" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.createVehicle = async function (req, res) {
     try {
          var newVehicleId;
          var QtyVehicles = await vehicle.count();
          if (QtyVehicles > 0) {
               var last = await vehicle.find({}, null, { sort: { vehicleId: -1 } }).limit(1);

               if (last.length > 0) {
                    newVehicleId = last[0].vehicleId + 1;
               }
          } else {
               newVehicleId = 1;
          }

          if (!req.body.vehicleTypeId) {
               return res.status(400).json({ erro: "Vehicle Id Type was not sent" });
          }
          if (!req.body.description) {
               return res.status(400).json({ erro: "Description for vehicle was not sent" });
          }
          var vehicleType = await vehicleTypeController.vehicleTypeGetById(Number(req.body.vehicleTypeId));

          if (!vehicleType.valid) {
               return res.status(vehicleType.status).json(vehicleType.res);
          }
          vehicleType = vehicleType.res;

          var infoCreation = {
               description: req.body.description,
               vehicleId: newVehicleId,
               vehicleTypeId: vehicleType.vehicleTypeId,
               available: true,
               batery: 100,
          };

          var newVehicle = new vehicle(infoCreation);
          newVehicle
               .save()
               .then((result) => {
                    return res.status(201).jsonp(newVehicle);
               })
               .catch((err) => {
                    return res.status(500).jsonp({
                         error: { message: err.message },
                    });
               });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.getById = async function (req, res) {
     var vehicleId = req.params.id;

     try {
          if (!vehicleId || !parseInt(vehicleId)) {
               return res.status(400).json({ error: "VehicleId not sent or is not a number" });
          }
          var givenVehicle = await vehicle.findOne({ vehicleId: vehicleId });

          if (givenVehicle) {
               return res.status(200).json(givenVehicle);
          }

          return res.status(404).json({ error: "Vehicle not found" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.updateVehicle = async function (req, res) {
     var vehicleId = req.params.id;
     var dataToModify = {};

     if (!vehicleId || !parseInt(vehicleId)) {
          return res.status(400).json({ error: "VehicleTypeId not sent or is not a number" });
     }
     if (!req.body) {
          return res.status(400).json({ error: "There is no information sent in body request" });
     }
     try {
          if (req.body.vehicleTypeId) {
               var vehicleType = await vehicleTypeController.vehicleTypeGetById(req.body.vehicleTypeId);
               if (!vehicleType.valid) {
                    return res.status(vehicleType.status).json(vehicleType.res);
               }
               vehicleType = vehicleType.res;
               dataToModify.vehicleTypeId = vehicleType.vehicletypeId;
          }

          if (req.body.description) {
               dataToModify.description = req.body.description;
          }

          if (req.body.available) {
               dataToModify.available = req.body.available;
          }

          if (req.body.batery) {
               dataToModify.batery = req.body.batery;
          }

          var givenVehicle = await vehicle.findOneAndUpdate({ vehicleId }, dataToModify);

          if (givenVehicle) {
               return res.status(201).json({ message: "Vehicle Updated!" });
          }

          return res.status(400).json({ error: "Request bad formated" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.getDetails = async function (req, res) {
     var vehicleId = req.params.id;

     try {
          if (!vehicleId || !parseInt(vehicleId)) {
               return res.status(400).json({ error: "VehicleId not sent or is not a number" });
          }
          var resVehicle = await vehicle.findOne({ vehicleId: vehicleId });
          if (resVehicle) {
               var vehicleType = await vehicleTypeController.vehicleTypeGetById(resVehicle.vehicleTypeId);

               if (vehicleType.valid && vehicleType.res) {
                    return res.status(200).json({
                         vehicleId: resVehicle.vehicleId,
                         description: resVehicle.description,
                         batery: resVehicle.batery,
                         available: resVehicle.available,
                         vehicleType: {
                              id: vehicleType.res.vehicleTypeId,
                              description: vehicleType.res.description,
                              pricePerMinute: vehicleType.res.pricePerMinute,
                         },
                    });
               }
          }

          return res.status(404).json({ error: "Vehicle not found" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.getAllAvailableDetails = async function (req, res) {
     try {
          var vehicles = await vehicle.find({ available: true });

          if (vehicles) {
               const availableVehicles = [];

               const task = new Promise((resolve, reject) => {
                    vehicles.forEach(async (vehicle, index, array) => {
                         var vehicleType = await vehicleTypeController.vehicleTypeGetById(vehicle.vehicleTypeId);
                         if (vehicleType.valid && vehicleType.res) {
                              availableVehicles.push({
                                   vehicleId: vehicle.vehicleId,
                                   description: vehicle.description,
                                   batery: vehicle.batery,
                                   available: vehicle.available,
                                   VehicleType: {
                                        id: vehicleType.res.vehicleTypeId,
                                        description: vehicleType.res.description,
                                        pricePerMinute: vehicleType.res.pricePerMinute,
                                   },
                              });
                         }

                         if (index === array.length - 1) {
                              resolve();
                         }
                    });
               });

               task.then(() => {
                    return res.status(200).json(availableVehicles);
               });
          } else {
               return res.status(404).json({ error: "No Vehicles Available!" });
          }
     } catch (error) {
          return res.status(500).json({ error });
     }
};
