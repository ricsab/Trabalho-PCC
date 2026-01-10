const mongoose = require("mongoose");
const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs/promises");
const User = mongoose.model("UserModel");
const UserRole = mongoose.model("UserRolesModel");

const ageGenderServiceURL = "http://127.0.0.1:5000/api/predict";

exports.register = async (req, res) => {
     try {
          const body = req.body;
          const file = req.file;

          const valid = body.username && body.name && body.email && body.password && file && body.userRoleId;

          if (!valid) return res.status(400).json({ message: "There are required fields not set!" });

          // Check if user exists
          if (await findUserByUsernameEmail(body.username, body.email)) {
               return res.status(400).json({ message: "The specified user already exists!" });
          }

          // get age and gender prediction
          let ageGenderPred = await sendImageToAgeGenderPrediction(file);

          if (!ageGenderPred) return res.status(400).json({ message: "User image not set!" });

          if (ageGenderPred.age < 16) {
               return res.status(400).json({ message: "The User specified is a minor(<16)!" });
          }

          let user = new User();
          user.username = body.username;
          user.name = body.name;
          user.email = body.email;
          user.userImage = file.path;
          user.password = { hash: "", session: "" };
          user.address = {
               city: "",
               street: "",
               country: "",
               postCode: "",
               houseNumber: -1,
          };
          user.age = ageGenderPred.age;
          user.gender = ageGenderPred.gender;
          user.userRoleId = body.userRoleId;
          user.balance = 0;
          user.jwtToken = "";
          user.setPassword(body.password);

          let result = await user.save();

          if (result) {
               return res.status(200).json({ message: `User ${result.username} registered!` });
          }

          return res.status(400).json({ message: "An unexpected error occured!" });
     } catch (err) {
          return res.status(500).json({ message: "An unexpected error occured!", erro: err });
     }
};

exports.login = async (req, res) => {
     try {
          const body = req.body;
          const valid = body.username && body.password;

          if (!valid) return res.status(400).json({ message: "There are required fields not set!" });

          let user = await User.findOne({ username: body.username });

          if (!user) return res.status(400).json({ message: "The user specified doesnt exist!" });

          if (!user.validatePassword(user.password, body.password)) return res.status(400).json({ message: "Wrong password!" });

          let role = await findRoleById(user.userRoleId);
          let token = user.generateJWT(role, user.email, user.username, user._id);

          // Update token field
          user.jwtToken = token;

          // Update user
          let result = await user.save();

          if (result) {
               return res.status(200).json({ message: `User ${result.username} logged successfully!`, token: token });
          }
          return res.status(400).json({ message: "An unexpected error occured!" });
     } catch (err) {
          return res.status(500).json({ message: "An unexpected error occured!", error: err });
     }
};

exports.addBalance = async (req, res) => {
     try {
          const username = req.body.username;
          const balance = Number(req.body.balance);
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          // request is valid
          if (username && token && !isNaN(balance) && balance > 0) {
               let user = await User.findOne({ username: username });

               if (!user) return res.status(400).json({ message: "The user specified doesn't exists!" });

               if (user.jwtToken != token) {
                    return res.status(403).json({ message: "The user specified isn't allowed!" });
               }

               // set balance
               user.balance += balance;

               // update user
               let result = await user.save();

               if (result) {
                    return res.status(200).json({ message: `Your current balance is: ${result.balance}` });
               }

               return res.status(400).json({ message: "An unespected error occured" });
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (err) {
          return res.status(500).json({ message: "An unespected error occured", error: err });
     }
};

exports.takeBalance = async (req, res) => {
     try {
          const username = req.body.username;
          const balance = Number(req.body.balance);
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          // request is valid
          if (username && token && !isNaN(balance) && balance > 0) {
               let user = await User.findOne({ username: username });

               if (!user) return res.status(400).json({ message: "The user specified doesn't exists!" });

               if (user.jwtToken != token) {
                    return res.status(403).json({ message: "The user specified isn't allowed!" });
               }

               // set balance
               user.balance -= balance;
               user.balance = user.balance < 0 ? 0 : user.balance;

               // update user
               let result = await user.save();

               if (result) {
                    return res.status(200).json({ message: `Your current balance is: ${result.balance}` });
               }

               return res.status(400).json({ message: "An unespected error occured" });
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (err) {
          return res.status(500).json({ message: "An unespected error occured", error: err });
     }
};

exports.getByUsername = async (req, res) => {
     try {
          const username = req.params.username;
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (username) {
               let user = await User.findOne({ username: username, jwtToken: token });

               if (user) {
                    return res.status(200).json(user);
               }

               return res.status(400).json({ message: "User not found" });
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (err) {
          return res.status(500).json({ message: "An unespected error occured", error: err });
     }
};

const sendImageToAgeGenderPrediction = async (file) => {
     return { age: 20, gender: "male" };
     // if (file) {
     //      const form = new FormData();
     //      const image = await fs.readFile(file.path);
     //      form.append("image", image, file.originalname);
     //      const response = await axios.post(ageGenderServiceURL, form, {
     //           headers: {
     //                ...form.getHeaders(),
     //           },
     //      });

     //      return response.data;
     // }
};

const findRoleById = async (roleId) => {
     try {
          let role = await UserRole.findOne({ userRolesId: roleId });

          if (role) return role.description;

          return "";
     } catch (err) {
          return "";
     }
};

const findUserByUsernameEmail = async (username, email) => {
     try {
          let user = await User.findOne({ $or: [{ username: username }, { email: email }] });
          return user;
     } catch (err) {
          return null;
     }
};
