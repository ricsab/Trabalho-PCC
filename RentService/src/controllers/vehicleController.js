const axios = require("axios");
const vehicleServiceURL = "http://localhost:5003/vehicle";
const vehicleTypeServiceURL = "http://localhost:5003/vehicleType";
const vehicleDetailsServiceURL = "http://localhost:5003/vehicleDetails";
const availableVehiclesDetailsServiceURL = "http://localhost:5003/vehicleAvailableDetails";

exports.getAllVehicles = async (req, res) => {
     try {
          const response = await axios.get(vehicleServiceURL);

          if (response) {
               return res.status(200).json(response.data);
          }

          return res.status(204).json({ message: "No vehicles found!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getAllVehiclesTypes = async (req, res) => {
     try {
          const response = await axios.get(vehicleTypeServiceURL);

          if (response) {
               return res.status(200).json(response.data);
          }

          return res.status(204).json({ message: "No vehicles types found!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getVehicleById = async (req, res) => {
     try {
          const id = Number(req.params.id);

          if (!isNaN(id) && id > 0) {
               const response = await axios.get(`${vehicleServiceURL}/${id}`);

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(204).json({ message: "No vehicle found!" });
          }

          return res.status(400).json({ message: "Must provide a valid id!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getVehicleTypeById = async (req, res) => {
     try {
          const id = Number(req.params.id);

          if (!isNaN(id) && id > 0) {
               const response = await axios.get(`${vehicleTypeServiceURL}/${id}`);

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(204).json({ message: "No vehicle type found!" });
          }

          return res.status(400).json({ message: "Must provide a valid id!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.createVehicle = async (req, res) => {
     try {
          const body = req.body;

          // check if is valid
          if (body && body.vehicleTypeId && body.description) {
               const response = await axios.post(`${vehicleServiceURL}`, {
                    description: body.description,
                    vehicleTypeId: body.vehicleTypeId,
               });

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(400).json({ message: "Error while sending request!" });
          }

          return res.status(400).json({ message: "Must provide required fields!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.createVehicleType = async (req, res) => {
     try {
          const body = req.body;

          // check if is valid
          if (body && body.pricePerMinute && body.description) {
               const response = await axios.post(`${vehicleTypeServiceURL}`, {
                    description: body.description,
                    pricePerMinute: body.pricePerMinute,
               });

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(400).json({ message: "Error while sending request!" });
          }

          return res.status(400).json({ message: "Must provide required fields!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.updateVehicle = async (req, res) => {
     try {
          const body = req.body;
          const id = req.params.id;

          // check if is valid
          if (body && id) {
               const response = await axios.put(`${vehicleServiceURL}/${id}`, body);

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(400).json({ message: "Error while sending request!" });
          }

          return res.status(400).json({ message: "Must provide required fields!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.updateVehicleType = async (req, res) => {
     try {
          const body = req.body;
          const id = req.params.id;

          // check if is valid
          if (body && id) {
               const response = await axios.put(`${vehicleTypeServiceURL}/${id}`, body);

               if (response) {
                    return res.status(200).json(response.data);
               }

               return res.status(400).json({ message: "Error while sending request!" });
          }

          return res.status(400).json({ message: "Must provide required fields!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getVehicleDetailsById = async (req, res) => {
     try {
          const id = Number(req.params.id);

          if (id && !isNaN(id) && id > 0) {
               const response = await axios.get(`${vehicleDetailsServiceURL}/${id}`);
               if (response) {
                    return res.status(200).json(response.data);
               } else {
                    return res.status(404).json({ message: "Vehicle not found!" });
               }
          }
          return res.status(400).json({ message: "Must provide required fields!" });
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getAvailableVehiclesDetails = async (req, res) => {
     try {
          const response = await axios.get(`${availableVehiclesDetailsServiceURL}`);
          if (response) {
               return res.status(200).json(response.data);
          } else {
               return res.status(404).json({ message: "Vehicles not found!" });
          }
     } catch (error) {
          return res.status(500).json(error);
     }
};

/* Aux functions */
exports.getAvailableVehicles = async () => {
     const response = await axios.get(`${availableVehiclesDetailsServiceURL}`);
     return response;
};

exports.getVehicleInformationById = async (id) => {
     try {
          const response = await axios.get(`${vehicleDetailsServiceURL}/${id}`);
          return response.data;
     } catch (error) {
          return null;
     }
};

exports.updateVehicleById = async (id, vehicle) => {
     try {
          // check if is valid
          if (vehicle && id) {
               const response = await axios.put(`${vehicleServiceURL}/${id}`, vehicle);

               if (response && response.data) {
                    return true;
               }
               return false;
          }
          return false;
     } catch (error) {
          return false;
     }
};
