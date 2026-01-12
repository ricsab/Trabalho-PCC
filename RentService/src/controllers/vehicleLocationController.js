const axios = require("axios");
const vehicleLocationServiceURL = process.env.VEHICLE_LOCATION_SERVICE_URL || "http://localhost:3000/vehicleLocation";

exports.getAll = async (req, res) => {
     try {
          const from = req.query.from;
          const to = req.query.to;
          let query = "";

          if (from && to) query = `?from=${from}&to=${to}`;

          const response = await axios.get(`${vehicleLocationServiceURL}${query}`);
          return res.status(200).json(response.data);
     } catch (err) {
          return res.status(500).json({ message: "An expected error ocurred", error: err.response.data });
     }
};

exports.getById = async (req, res) => {
     try {
          const from = req.query.from;
          const to = req.query.to;
          const vehicleId = req.params.id;
          let query = "";

          if (from && to) query = `?from=${from}&to=${to}`;

          const response = await axios.get(`${vehicleLocationServiceURL}/${vehicleId}${query}`);
          return res.status(200).json(response.data);
     } catch (err) {
          return res.status(500).json({ message: "An expected error ocurred", error: err.response.data });
     }
};

exports.getLatestLocation = async (req, res) => {
     try {
          const id = Number(req.params.id);

          if (isNaN(id) || id < 1) {
               return res.status(400).json({ message: "Must provide a valid vehicle ID." });
          }

          const response = await this.getLatestLocationById(id);

          if (response) {
               return res.status(200).json(response.data);
          }
          return res.status(400).json({ error: `Error while getting latest location for vehicle ${id}` });
     } catch (error) {
          return res.status(500).json(error.response.data);
     }
};

exports.getAllLatestLocation = async (req, res) => {
     try {
          const response = await axios.get(`${vehicleLocationServiceURL}/getAllLatestLocation`);

          if (response) {
               return res.status(200).json(response.data);
          }
          return res.status(400).json({ error: `Error while getting latest location for all vehicles` });
     } catch (error) {
          return res.status(500).json(error.response.data);
     }
};

exports.startOrStopLocationGenerationByVehicle = async (req, res) => {
     try {
          const id = Number(req.params.id);
          const start = req.params.start;

          if (isNaN(id) || id <= 0) return res.status(400).json({ message: "Must provide a valid vehicle id" });

          if (!start) return res.status(400).json({ message: "Must provide a option!" });

          let response = "";
          if (start == true) {
               response = await this.startLocationGenerationByVehicle(id);
          } else {
               response = await this.stopLocationGenerationByVehicle(id);
          }

          if (response) {
               return res.status(200).json({ message: `${start == true ? "Start" : "Stop"} location generations for vehicle ${id}` });
          } else {
               return res.status(400).json({ message: `Unable to ${start == true ? "Start" : "Stop"} location generations for vehicle ${id}` });
          }
     } catch (error) {
          return res.status(500).json(error.response.data);
     }
};

exports.getLatestLocationById = async (id) => {
     const response = await axios.get(`${vehicleLocationServiceURL}/getLatestLocation/${id}`);
     return response;
};

exports.startLocationGenerationByVehicle = async (id) => {
     try {
          const response = await axios.get(`${vehicleLocationServiceURL}/${id}/true`);

          if (response.data && response.data.message && response.data.message.toString().toLowerCase() == "started") {
               return true;
          } else {
               return false;
          }
     } catch {
          return false;
     }
};

exports.stopLocationGenerationByVehicle = async (id) => {
     try {
          const response = await axios.get(`${vehicleLocationServiceURL}/${id}/false`);

          if (response.data && response.data.message && response.data.message.toString().toLowerCase() == "stoped") {
               return true;
          } else {
               return false;
          }
     } catch {
          return false;
     }
};
