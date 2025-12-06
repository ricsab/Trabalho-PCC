/*
 * Main service configurations
 */

const environment = {
  mqtt: {
    broker: 'localhost',
    port: 1883,
    topic: 'VehicleLocation',
  }
};

module.exports = environment;