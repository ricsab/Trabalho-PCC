const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AddressSchema = mongoose.Schema({
     city: String,
     street: String,
     country: String,
     postCode: String,
     houseNumber: Number,
});

const schema = mongoose.Schema;
const UserSchema = new schema(
     {
          username: {
               type: String,
               unique: true,
               required: true,
          },
          name: {
               type: String,
          },
          email: {
               type: String,
               trim: true,
               lowercase: true,
               unique: true,
               required: true,
               validate: [validator.isEmail, "Invalid email!"],
          },
          password: {
               type: {
                    hash: String,
                    salt: String,
               },
               required: true,
          },
          userImage: {
               type: String,
               required: true,
          },
          address: {
               type: AddressSchema,
          },
          age: {
               type: Number,
               required: true,
          },
          gender: {
               type: String,
               required: true,
          },
          userRoleId: {
               type: Number,
               required: true,
          },
          balance: {
               type: Number,
          },
          jwtToken: {
               type: String,
          },
     },
     { collection: "UserCollection" }
);

UserSchema.methods.setPassword = function (password) {
     const salt = crypto.randomBytes(16).toString("hex");
     this.password.salt = salt;
     this.password.hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
};

UserSchema.methods.validatePassword = function (userPassword, passwordToCheck) {
     const hash = crypto.pbkdf2Sync(passwordToCheck, userPassword.salt, 1000, 64, "sha512").toString("hex");
     return userPassword.hash === hash;
};

UserSchema.methods.generateJWT = (role, email, username, id) => {
     const validaty = new Date();
     validaty.setDate(validaty.getDate() + 7);
     return jwt.sign(
          {
               _id: id,
               username: username,
               email: email,
               exp: parseInt(validaty.getTime() / 1000, 10),
               role: role,
          },
          "jwtsecret"
     );
};

module.exports = mongoose.model("UserModel", UserSchema);
