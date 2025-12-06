const vehicleType = require("../models/vehicleTypeModel");

exports.getAll = async function (req, res) {
     try {
          var vehicleTypes = await vehicleType.find();

          if (vehicleTypes) {
               return res.status(200).json(vehicleTypes);
          }

          return res.status(400).json({ error: "Request bad formated" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.create = async function (req, res) {
     try {
          var body = req.body;
          // if valid
          if (body.description && body.pricePerMinute) {
               var newVehicleTypeId;
               var newVehicleType = new vehicleType();

               var QtyvehicleTypes = await vehicleType.count();

               if (QtyvehicleTypes > 0) {
                    var last = await vehicleType.find({}, null, { sort: { vehicleTypeId: -1 } }).limit(1);

                    if (last.length > 0) {
                         newVehicleTypeId = last[0].vehicleTypeId + 1;
                    }
               } else {
                    newVehicleTypeId = 1;
               }

               // set fields
               newVehicleType.vehicleTypeId = newVehicleTypeId;
               newVehicleType.description = body.description;
               newVehicleType.pricePerMinute = body.pricePerMinute;

               // save
               newVehicleType
                    .save()
                    .then((result) => {
                         return res.status(201).jsonp(result);
                    })
                    .catch((err) => {
                         return res.status(500).jsonp({
                              error: { message: err.message },
                         });
                    });
          } else {
               return res.status(400).json({ message: "There are required fields missing." });
          }
     } catch (error) {
          return res.status(500).json({ error });
     }
};

const vehicleTypeGetById = (exports.vehicleTypeGetById = async function (id) {
     if (!id || !parseInt(id)) {
          return { valid: false, status: 400, res: { error: "VehicleTypeId not sent or is not a number" } };
     }
     var givenVehicleType = await vehicleType.findOne({ vehicleTypeId: id });

     if (givenVehicleType) {
          return { valid: true, status: 200, res: givenVehicleType };
     } else {
          return { valid: false, status: 404, res: { error: "Vehicle type not found" } };
     }
});

exports.getById = async function (req, res) {
     var vehicletypeId = req.params.id;

     try {
          var result = await vehicleTypeGetById(vehicletypeId);

          return res.status(result.status).json(result.res);
     } catch (error) {
          return res.status(500).json({ error });
     }
};

exports.update = async function (req, res) {
     var vehicletypeId = req.params.id;
     var dataToModify = req.body;

     if (!vehicletypeId || !parseInt(vehicletypeId)) {
          return res.status(400).json({ error: "VehicleTypeId not sent or is not a number" });
     }
     if (!dataToModify) {
          return res.status(400).json({ error: "There is no information sent in body request" });
     }
     try {
          var givenVehicleType = await vehicleType.findOneAndUpdate({ vehicleTypeId: vehicletypeId }, dataToModify);

          if (givenVehicleType) {
               return res.status(201).json({ message: "Vehicle Type Updated!" });
          }

          return res.status(400).json({ error: "Request bad formated" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};
