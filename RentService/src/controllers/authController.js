const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs/promises");

const authServiceURL = "http://localhost:5001/users";

exports.register = async (req, res) => {
     try {
          const body = req.body;
          const file = req.file;

          if (body && file) {
               const form = new FormData();
               form.append("image", file.buffer, file.originalname);
               form.append("username", body.username);
               form.append("name", body.name);
               form.append("email", body.email);
               form.append("password", body.password);
               form.append("userRoleId", body.userRoleId);

               const response = await axios.post(`${authServiceURL}/register`, form, {
                    headers: {
                         ...form.getHeaders(),
                    },
               });
               return res.status(200).json(response.data);
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (err) {
          return res.status(500).json({ message: "An unexpected error occured!", erro: err.response.data });
     }
};

exports.login = async (req, res) => {
     try {
          const body = req.body;

          if (body.username && body.password) {
               const response = await axios.post(`${authServiceURL}/login`, {
                    username: body.username,
                    password: body.password,
               });
               return res.status(200).json(response.data);
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (err) {
          return res.status(500).json({ erro: err.response.data });
     }
};

exports.addBalance = async (req, res) => {
     try {
          const body = req.body;
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (!token) return res.status(403).json({ message: "Not Allowed!" });

          if (body.username && body.balance) {
               // Set auth header
               const config = {
                    headers: { Authorization: `Bearer ${token}` },
               };

               const response = await axios.post(
                    `${authServiceURL}/addBalance`,
                    {
                         username: body.username,
                         balance: body.balance,
                    },
                    config
               );
               return res.status(200).json(response.data);
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (error) {
          return res.status(500).json({ message: "An unexpected error occured!", error: error });
     }
};

exports.takeBalance = async (req, res) => {
     try {
          const body = req.body;
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (!token) return res.status(403).json({ message: "Not Allowed!" });

          if (body.username && body.balance) {
               // Set auth header
               const config = {
                    headers: { Authorization: `Bearer ${token}` },
               };

               const response = await axios.post(
                    `${authServiceURL}/takeBalance`,
                    {
                         username: body.username,
                         balance: body.balance,
                    },
                    config
               );
               return res.status(200).json(response.data);
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (error) {
          return res.status(500).json({ message: "An unexpected error occured!", error: error.response.data });
     }
};

exports.getByUsername = async (req, res) => {
     try {
          const username = req.params.username;
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (!token) return res.status(403).json({ message: "Not Allowed!" });

          if (username) {
               // Set auth header
               const config = {
                    headers: { Authorization: `Bearer ${token}` },
               };
               const response = await axios.get(`${authServiceURL}/getByUsername/${username}`, config);

               return res.status(200).json(response.data);
          } else {
               return res.status(400).json({ message: "There are required fields not set!" });
          }
     } catch (error) {
          return res.status(500).json({ message: "An unexpected error occured!", error: error.response.data });
     }
};

exports.takeBalanceByUsername = async (authToken, username, balance) => {
     try {
          if (!authToken) return false;

          if (username && balance) {
               // Set auth header
               const config = {
                    headers: { Authorization: `Bearer ${authToken}` },
               };

               await axios.post(
                    `${authServiceURL}/takeBalance`,
                    {
                         username: username,
                         balance: balance,
                    },
                    config
               );
               return true;
          } else {
               return false;
          }
     } catch (error) {
          return false;
     }
};
