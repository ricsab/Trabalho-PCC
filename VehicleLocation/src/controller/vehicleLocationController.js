const mongoose = require("mongoose");
const VehicleLocationSchema = mongoose.model("VehicleLocationModel");
const serviceRegister = require("../mqqt/serviceRegister");

const isValidDate = function (date) {
     return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};

async function FindInVehicleLocationModel(vehicleId, from, to) {
     var objectToFind = {};
     var from;
     var to;

     if (vehicleId && vehicleId !== 0) {
          objectToFind.vehicleId = parseInt(vehicleId);
     }

     if (from && to && isValidDate(from) && isValidDate(to)) {
          from = new Date(from);
          to = new Date(to);
     }

     try {
          if (from && to) {
               var records = await VehicleLocationSchema.find(objectToFind);

               records = records.filter((x) => {
                    var recordDate = new Date(x.date);
                    return recordDate > from && recordDate < to;
               });
          } else {
               var records = await VehicleLocationSchema.find(objectToFind);
          }

          return { valid: true, records };
     } catch (error) {
          return { valid: false, error: error };
     }
}

exports.getAll = async function (req, res) {
     var from = req.query.from;
     var to = req.query.to;

     var result = await FindInVehicleLocationModel(0, from, to);

     if (result.valid) {
          return res.status(200).json(result.records);
     } else {
          return res.status(400).json(result.error);
     }
};

exports.getById = async function (req, res) {
     var vehicleId = req.params.id;
     var from = req.query.from;
     var to = req.query.to;

     var result = await FindInVehicleLocationModel(vehicleId, from, to);

     if (result.valid) {
          return res.status(200).json(result.records);
     } else {
          return res.status(400).json(result.error);
     }
};

exports.startOrStopLocation = async (req, res) => {
     var vehicleId = req.params.id;
     var reset = req.params.start == "false";
     serviceRegister.publish(vehicleId, reset);

     if (!reset) return res.status(200).json({ message: "started" });
     else return res.status(200).json({ message: "stoped" });
};

exports.getLatest = async (req, res) => {
     try {
          var id = Number(req.params.id);

          if (!isNaN(id) && id > 0) {
               var result = await VehicleLocationSchema.findOne({ vehicleId: id }, { vehicleId: 1, lat: 1, long: 1, date: 1, _id: 0 }, { sort: { date: -1 } });

               if (result) {
                    return res.status(200).json(result);
               } else {
                    return res.status(400).json({ message: `Location not found for Vehicle ${id}` });
               }
          }
     } catch (error) {
          return res.status(500).json({ message: "An unexpected error occured!", error: error });
     }
};

exports.getAllLatest = async (req, res) => {
     try {
          var result = await VehicleLocationSchema.aggregate([
               {
                    $group: {
                         _id: "$vehicleId",
                         details: {
                              $first: {
                                   date: "$date",
                                   lat: "$lat",
                                   long: "$long",
                              },
                         },
                    },
               },
          ]);

          if (result) {
               return res.status(200).json(result);
          } else {
               return res.status(400).json({ message: `Location not found for Vehicle ${id}` });
          }
     } catch (error) {
          return res.status(500).json({ message: "An unexpected error occured!", error: error });
     }
};
