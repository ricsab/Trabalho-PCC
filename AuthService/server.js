const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");
const openAPIDoc = require("./api-docs/open-api.json");

require("dotenv").config();
if (!process.env.PORT) {
     throw new Error("indique a porta onde iniciar o servidor HTTP: variável de ambiente PORT");
}
const PORT = process.env.PORT;

const app = express();

// database configurations
const database = require("./src/configurations/dbconfig.js");
const userModel = require("./src/models/userModel");
const userRolesModel = require("./src/models/userRolesModel");

// import routes
const userRoutes = require("./src/routes/userRoutes");
const userRolesRoutes = require("./src/routes/userRolesRoutes");

// Configure middlewares
app.use(
     bodyParser.urlencoded({
          extended: true,
     })
);
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization"); // 'Content-Type');
     res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
     next();
});

app.use("/users", userRoutes);
app.use("/userRoles", userRolesRoutes);

// middleware para incluir a documentação OpenAPI
app.use(
     "/", // a rota onde a documentação ficará disponível
     swaggerUI.serve, // servidor da documentação
     swaggerUI.setup(openAPIDoc) // documento com a especificação da API
);

app.listen(PORT, () => console.log(`servidor a executar em http://localhost:${PORT}`));
