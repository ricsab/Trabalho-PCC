/*
 * Main service configurations
 */

const environment = {
  mqtt: {
    broker: (process.env.MQTT_BROKER || 'localhost').trim(),
    port: process.env.MQTT_PORT || 1883,
    topic: process.env.MQTT_TOPIC || 'VehicleLocation',
  },
  db: {
    host: process.env.DBHOST || 'mongodb://localhost:27017/',
    name: process.env.DBNAME || 'VehicleLocation',
  }
};

console.log("Config loaded:", JSON.stringify(environment, null, 2));

module.exports = environment;