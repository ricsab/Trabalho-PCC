const mongoose = require("mongoose");
const VehicleType = require("./src/models/vehicleTypeModel");
const Vehicle = require("./src/models/vehicleModel");
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

     console.log("Seeding database");

     // Verify if already exists
     const vehcilesTypes = await VehicleType.find({});
     const vehicles = await Vehicle.find({});

     if (!vehcilesTypes || vehcilesTypes.length == 0) {
          console.log("Seeding vehicle types.");

          var vehicleType = new VehicleType();
          vehicleType.vehicleTypeId = 1;
          vehicleType.description = "Carro - 5 lugares";
          vehicleType.pricePerMinute = 1.5;
          await vehicleType.save();

          vehicleType = new VehicleType();
          vehicleType.vehicleTypeId = 2;
          vehicleType.description = "Mota";
          vehicleType.pricePerMinute = 0.8;
          await vehicleType.save();

          vehicleType = new VehicleType();
          vehicleType.vehicleTypeId = 3;
          vehicleType.description = "Trotinete";
          vehicleType.pricePerMinute = 0.5;
          await vehicleType.save();

          vehicleType = new VehicleType();
          vehicleType.vehicleTypeId = 4;
          vehicleType.description = "Carro - 2 lugares";
          vehicleType.pricePerMinute = 1.2;
          await vehicleType.save();
     }

     if (!vehicles || vehicles.length == 0) {
          console.log("Seeding vehicle.");

          var vehicle = new Vehicle();
          vehicle.vehicleId = 1;
          vehicle.description = "Carro elétrico de 5 lugares preto, marca Mercedes";
          vehicle.vehicleTypeId = 1;
          vehicle.available = true;
          vehicle.batery = 100;
          await vehicle.save();

          vehicle = new Vehicle();
          vehicle.vehicleId = 2;
          vehicle.description = "Mota elétrica branca, marca Xiaomi";
          vehicle.vehicleTypeId = 2;
          vehicle.available = true;
          vehicle.batery = 100;
          await vehicle.save();

          vehicle = new Vehicle();
          vehicle.vehicleId = 3;
          vehicle.description = "Trotinete elétrica cinzenta, marca Xiaomi";
          vehicle.vehicleTypeId = 3;
          vehicle.available = true;
          vehicle.batery = 100;
          await vehicle.save();

          vehicle = new Vehicle();
          vehicle.vehicleId = 4;
          vehicle.description = "Carro elétrico de 2 lugares branco, marca Smart";
          vehicle.vehicleTypeId = 4;
          vehicle.available = true;
          vehicle.batery = 100;
          await vehicle.save();
     }

     console.log("Seed Complete!");
     mongoose.connection.close();
});
