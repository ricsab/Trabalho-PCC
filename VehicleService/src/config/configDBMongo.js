const mongoose = require("mongoose");

const mongodb = {
     pathLocalhost: `${process.env.DBHOST}${process.env.DBNAME}`,
     pathAtlas: "mongodb+srv://...",
};

const urlBaseDados = mongodb.pathLocalhost;
mongoose.connect(urlBaseDados, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
     console.log(`Mongoose connected to ${urlBaseDados}`);
});
mongoose.connection.on("error", (err) => {
     console.log("Mongoose error connectiong: ", err);
});
mongoose.connection.on("disconnected", () => {
     console.log("Mongoose: the connection was disconnected. ");
});
