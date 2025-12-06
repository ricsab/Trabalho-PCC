const mongoose = require("mongoose");
const UserRoles = mongoose.model("UserRolesModel");

exports.getAll = async (req, res) => {
     try {
          let userRoles = await UserRoles.find();

          if (userRoles) {
               return res.status(200).json(userRoles);
          }

          return res.status(400).json({ error: "Request bad formated" });
     } catch (error) {
          return res.status(500).json({ error });
     }
};
