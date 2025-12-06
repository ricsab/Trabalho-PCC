"use strict";
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const vehicleTypeSchema = new schema(
     {
          vehicleTypeId: {
               type: Number,
          },
          description: {
               type: String,
          },
          pricePerMinute: {
               type: Number,
          },
     },
     { collection: "VehicleTypeCollection" }
);

module.exports = mongoose.model("VehicleTypeModel", vehicleTypeSchema);
