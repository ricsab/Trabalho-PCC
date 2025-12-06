const express = require("express");
const authController = require("../controllers/authController");
const multer = require("multer");
const authorization = require("../middleware/authorization");
const role = require("../models/roles");

const router = express.Router();

// configurations
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", upload.single("image"), authController.register);
router.post("/login", authController.login);
router.post("/addBalance", authorization.authorize([role.User, role.Manager]), authController.addBalance);
router.post("/takeBalance", authorization.authorize([role.User, role.Manager]), authController.takeBalance);
router.get("/getByUsername/:username", authorization.authorize([role.User, role.Manager]), authController.getByUsername);

module.exports = router;
