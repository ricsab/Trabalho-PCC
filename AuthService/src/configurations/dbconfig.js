const mongoose = require("mongoose");

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
