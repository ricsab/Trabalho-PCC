"use strict";
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const UserRolesSchema = new schema(
     {
          userRolesId: {
               type: Number,
               unique: true,
          },
          description: {
               type: String,
          },
     },
     { collection: "UserRolesCollection" }
);

module.exports = mongoose.model("UserRolesModel", UserRolesSchema);
