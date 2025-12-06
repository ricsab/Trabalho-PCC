const mongoose = require("mongoose");

const schema = mongoose.Schema;
const RentSchema = new schema(
     {
          startDate: {
               type: Date,
          },
          endDate: {
               type: Date,
          },
          startLocation: {
               lat: {
                    type: Number,
               },
               long: {
                    type: Number,
               },
          },
          endLocation: {
               lat: {
                    type: Number,
               },
               long: {
                    type: Number,
               },
          },
          username: {
               type: String,
          },
          vehicleId: {
               type: Number,
          },
          description: {
               type: String,
          },
          balanceSpent: {
               type: Number,
          },
          active: {
               type: Boolean,
          },
     },
     { collection: "RentCollection" }
);

module.exports = mongoose.model("RentModel", RentSchema);
