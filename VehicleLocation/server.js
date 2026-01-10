const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");

require("dotenv").config();
if (!process.env.PORT) {
     throw new Error("indique a porta onde iniciar o servidor HTTP: variável de ambiente PORT");
}
const PORT = process.env.PORT;

// Configuration of mongoose -------------------------
const mongoose = require("mongoose");

//This require are needed because the mongoose execute this code despite it not being used before
const BD = require("./src/config/configBDMongo");
const VehicleLocationdModel = require("./src/models/vehicleLocationModel");

// Configuration of express -------------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Content-Type");
     res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
     next();
});

const vehicleLocationRoutes = require("./src/routes/vehicleLocationRoutes");
vehicleLocationRoutes(app);

/* Api documentation - Open API */
const openAPIDoc = require("./api-docs/openapi.json");
// middleware to include OpenAPI documentation
app.use(
     "/", // root that present the api documentation
     swaggerUI.serve, // server of the documentation
     swaggerUI.setup(openAPIDoc) // document that has the json information
);

const serviceRegister = require("./src/mqqt/serviceRegister");

app.listen(PORT, () => {
     console.log(`server executing at http://localhost:${PORT}`);
     serviceRegister.mqttReceiver();
});
