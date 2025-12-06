'use strict';
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const VehicleLocationSchema = new schema({
    vehicleId:{
        type: Number
    },
    lat:{
        type: Number
    },
    long:{
        type: Number
    },
    date:{
        type: Date
    },
}, {collection: 'VehicleLocationCollection'});

module.exports = mongoose.model('VehicleLocationModel', VehicleLocationSchema);