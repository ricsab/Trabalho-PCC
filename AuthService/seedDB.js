const mongoose = require("mongoose");
const UserRoles = require("./src/models/userRolesModel");
require("dotenv").config();

const mongodb = {
     pathLocalhost: `${process.env.DBHOST}${process.env.DBNAME}`,
     pathAtlas: "mongodb+srv://...",
};

const dbUrl = mongodb.pathLocalhost;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
     console.log(`Mongoose connected to ${dbUrl}`);
});

mongoose.connection.on("error", (err) => {
     console.log("Mongoose error connectiong: ", err);
});

mongoose.connection.on("disconnected", () => {
     console.log("Mongoose: the connection was disconnected. ");
});

mongoose.connection.on("open", async function () {
     console.log("Connection Successful!");

     // Check if exists
     const exist = await UserRoles.find({});

     if (!exist || exist.length == 0) {
          console.log("Seeding database");

          let role_user = new UserRoles();
          role_user.userRolesId = 1;
          role_user.description = "User";
          await role_user.save();

          let role_manager = new UserRoles();
          role_manager.userRolesId = 2;
          role_manager.description = "Manager";
          await role_manager.save();

          console.log("Database seeded.");
     }

     mongoose.connection.close();
});
