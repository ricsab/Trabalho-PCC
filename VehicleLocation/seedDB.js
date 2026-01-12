const mongoose = require("mongoose");
const VehicleLocationdModel = require("./src/models/vehicleLocationModel");
require("dotenv").config();

const mongodb = {
    pathLocalhost: `${process.env.DBHOST}${process.env.DBNAME}`,
    pathAtlas: "mongodb+srv://...",
};

const dbUrl = mongodb.pathLocalhost;
mongoose.connect(dbUrl);

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
    const exist = await VehicleLocationdModel.find({});

    if (!exist || exist.length == 0) {
        console.log("Seeding database");

        var lat_max = 41.58;//Latitude max
        var lat_min = 41.29; // Latitude min
        var long_max = -8.26; //Longitude max
        var long_min = -8.80; // Longitude min

        //Because we have 4 vehicles at the start
        for (let i = 1; i <= 4; i++) {
            var lat_vehicle1 = Math.random() * (lat_max - lat_min) + lat_min;
            var long_vehicle1 = Math.random() * (long_max - long_min) + long_min;

            let vehicleLocation = new VehicleLocationdModel();
            vehicleLocation.vehicleId = i;
            vehicleLocation.lat = lat_vehicle1;
            vehicleLocation.long = long_vehicle1;
            vehicleLocation.date = new Date();
            await vehicleLocation.save();
        }

        console.log("Database seeded.");
    }

    mongoose.connection.close();
});
