const express = require("express");
const userController = require("../controllers/userController");
const multer = require("multer");
const authorize = require("../middleware/authorization");
const role = require("../models/roles");
const router = express.Router();

// user images upload configuration
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, "./src/assets/images/");
     },
     filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = file.mimetype.split("/")[1];
          cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
     },
});
const upload = multer({ storage: storage });

router.post("/register", upload.single("image"), userController.register);
router.post("/login", userController.login);
router.post("/addBalance", authorize([role.User, role.Manager]), userController.addBalance);
router.post("/takeBalance", authorize([role.User, role.Manager]), userController.takeBalance);
router.get("/getByUsername/:username", authorize([role.User, role.Manager]), userController.getByUsername);

// Usage of Auth middleware example
//router.get("/", authorize(role.User), userController.validate);

module.exports = router;
