const mongoose = require("mongoose");
const VehicleLocationSchema = mongoose.model("VehicleLocationModel");
const receptor = require("./client-mqtt-receiver");
const lista_registos = new Array();

exports.leitura_mqtt = function () {
     console.log("Initiating...");

     receptor.connect(
          () => {
               console.log("Successfully connected to the mqtt broker");
          },
          (obj_msg) => {
               lista_registos.push(obj_msg.value);

               //Create object to be saved
               const record = new VehicleLocationSchema({
                    vehicleId: obj_msg.vehicleId,
                    lat: obj_msg.lat,
                    long: obj_msg.long,
                    date: new Date(obj_msg.timestamp),
               });
               //save to database
               record.save();
          }
     );
};

exports.publish = function (vehicleId, reset) {
     receptor.client.publish("/vehicle", `{"vehicleId":${vehicleId},"reset":${reset}}`, { qos: 0, retain: false }, (error) => {
          if (error) {
               console.error(error);
          }
     });
};
