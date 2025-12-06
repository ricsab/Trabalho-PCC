const express = require("express");
const userRolesController = require("../controllers/userRolesController");
const router = express.Router();

// Add authorization
router.get("/getAll", userRolesController.getAll);

module.exports = router;
