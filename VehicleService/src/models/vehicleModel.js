"use strict";
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const VehicleSchema = new schema(
     {
          vehicleId: {
               type: Number,
               required: true,
               unique: true,
          },
          description: {
               type: String,
          },
          vehicleTypeId: {
               type: Number,
          },
          available: {
               type: Boolean,
          },
          batery: {
               type: Number,
               min: 0,
               max: 100,
          },
     },
     { collection: "VehicleCollection" }
);

module.exports = mongoose.model("VehicleModel", VehicleSchema);
