// Configuration MQTT --------------------------
const mqtt = require("mqtt");

const config = require("../config/config");
const receptor = {};

receptor.connect = function connect(connectCallback, messageCallback) {
     const connectOptions = {
          host: config.mqtt.broker,
          port: config.mqtt.port,
     };

     console.log(`Trying to connect to the MQTT broker at ${config.mqtt.broker} on port ${config.mqtt.port}`);

     receptor.client = mqtt.connect(connectOptions);

     receptor.client.on("connect", () => {
          console.log(`Connected successfully to the MQTT broker at ${config.mqtt.broker} on port ${config.mqtt.port}`);

          receptor.client.subscribe(config.mqtt.topic);

          receptor.client.on("message", (topic, message) => {
               if (topic === config.mqtt.topic) {
                    const obj = JSON.parse(message.toString());
                    messageCallback(obj);
               }
          });

          connectCallback();
     });

     receptor.client.on("error", (err) => {
          console.log(`An error occurred. ${err}`);
     });
};

receptor.disconnect = function disconnect(cb) {
     receptor.client.end();
     cb();
};

module.exports = receptor;
