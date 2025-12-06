const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");

require("dotenv").config();
if (!process.env.PORT) {
     throw new Error("indique a porta onde iniciar o servidor HTTP: variável de ambiente PORT");
}
const PORT = process.env.PORT;

// configuração do mongoose -------------------------
const mongoose = require("mongoose");

//This require are needed because the mongoose execute this code despite it not being used before
const BD = require("./src/config/configDBMongo");
const vehicleModel = require("./src/models/vehicleModel");
const vehicleTypeModel = require("./src/models/vehicleTypeModel");

// configuração do express
const vehicleRoutes = require("./src/routes/vehicleRoutes");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization"); // 'Content-Type');
     res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
     next();
});

vehicleRoutes(app);

/* documentação da API - Open API
File > Convert and Save as JSON
 */
const openAPIDoc = require("./api-docs/openapi.json");
// middleware para incluir a documentação OpenAPI
app.use(
     "/", // a rota onde a documentação ficará disponível
     swaggerUI.serve, // servidor da documentação
     swaggerUI.setup(openAPIDoc) // documento com a especificação da API
);

app.listen(PORT, () => console.log(`servidor a executar em http://localhost:${PORT}`));
