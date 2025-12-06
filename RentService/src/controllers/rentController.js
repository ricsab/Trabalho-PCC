const axios = require("axios");
const validator = require("validator");
const authorize = require("../middleware/authorization");
const vehicleLocationController = require("./vehicleLocationController");
const vehicleController = require("./vehicleController");
const authController = require("./authController");
const rentModel = require("../models/rentModel");

const authServiceURL = "http://localhost:5001/users";
const authKey = "aa13693c-afc2-4cf6-863a-347194d9b504";
const geoserverUrl = "http://localhost:8080/geoserver/wfs?authkey=" + authKey + "&";

exports.startRental = async (req, res) => {
     try {
          const id = Number(req.params.id);

          // Get authorization token from authorization header
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          // Verify if it has a token
          if (!token) return res.status(401).json({ message: "Unauthorized!" });

          // decoded Token
          const decodedToken = authorize.verify(token);

          // Get username from token (to prevent client always send it)
          if (!decodedToken) {
               return res.status(401).json({ message: "Unauthorized!" });
          }

          const username = decodedToken.username;
          const user = await getUserByUsername(token, username);

          if (!user) {
               return res.status(401).json({ message: "Unauthorized!" });
          }

          // Check if it has balance
          if (user.balance < 2) {
               return res.status(400).json({ message: "Not enough balance!" });
          }

          if (!id || isNaN(id) || id <= 0 || id > 4) {
               // Verify for a valid vehicle Id
               return res.status(400).json({ message: "Must provide a valid vehicle Id." });
          }

          // get vehicle
          const vehicle = await vehicleController.getVehicleInformationById(id);

          if (!vehicle) return res.status(400).json({ message: "Vehicle not found!" });

          if (!vehicle.available) return res.status(400).json({ message: "Vehicle is not available!" });

          // min batery allowed
          if (vehicle.batery < 10) return res.status(400).json({ message: "Vehicle is not batery enough!" });

          // init rent object
          const rent = {};
          rent.username = username;
          rent.vehicleId = id;

          // get vehicle location
          const vehicleLocation = await getLocationByVehicleId(id);

          if (!vehicleLocation) {
               return res.status(400).json({ message: "Unable to get vehicle location!" });
          }

          rent.startLocation = {
               lat: vehicleLocation.lat,
               long: vehicleLocation.long,
          };

          // Create rent object
          const createdRent = await createRent(rent);

          if (!createdRent) return res.status(400).json({ message: "Unable to rent!" });

          //Start location service
          const locationStart = await vehicleLocationController.startLocationGenerationByVehicle(id);

          if (!locationStart) {
               // stop rent
               const rentToUpdate = {
                    description: "rent stopped by system.",
                    endDate: new Date(),
                    endLocation: rent.startLocation,
                    balance: 0,
                    active: false,
               };

               await updateRent(rentToUpdate, createdRent.id);

               return res.status(400).json({ message: "Rent Stopped by System.\n Motive: Unable to localizate vehicle!" });
          }

          // Update vehicle availability
          await vehicleController.updateVehicleById(id, { available: "false" });
          let totalBalance = 0;
          let totalBatery = 0;
          let rentDescription = "";

          const task = new Promise((resolve, reject) => {
               // 1 minute - To credit balance And vehicle battery
               let myInterval = setInterval(async () => {
                    // Get rent
                    const rent = await getRentById(createdRent.id);

                    if (rent.active) {
                         // Calculate balance and battery
                         totalBalance += vehicle.vehicleType.pricePerMinute;
                         totalBatery += 10;

                         if (totalBalance > user.balance - 1) {
                              rentDescription = "Rent stopped by no balance!";
                              clearInterval(myInterval);
                              resolve();
                         }

                         if (totalBatery > vehicle.batery - 5) {
                              rentDescription = "Rent stopped by no battery!";
                              clearInterval(myInterval);
                              resolve();
                         }
                    } else {
                         rentDescription = "Rent stopped by User!";
                         clearInterval(myInterval);
                         resolve();
                    }
               }, 60000);
          });

          await task;

          // Stop location generation
          await vehicleLocationController.stopLocationGenerationByVehicle(id);
          const lastLocationVehicle = await getLocationByVehicleId(id);
          let location = {};

          if (!lastLocationVehicle) {
               location = {
                    lat: "",
                    long: "",
               };
          } else {
               location = {
                    lat: lastLocationVehicle.lat,
                    long: lastLocationVehicle.long,
               };
          }

          // stop rent
          const rentToUpdate = {
               description: rentDescription,
               endDate: new Date(),
               endLocation: location,
               balance: totalBalance,
               active: "false",
          };

          await updateRent(rentToUpdate, createdRent.id);

          // Update vehicle availability and batery
          await vehicleController.updateVehicleById(id, { available: "true", batery: (vehicle.batery - totalBatery).toString() });

          // Update user balance
          await authController.takeBalanceByUsername(token, username, totalBalance);

          // get rental details
          const finalRentDetails = await getRentById(createdRent.id);

          if (finalRentDetails) {
               return res.status(200).json(finalRentDetails);
          } else {
               return res.status(400).json({ message: "Unable to show rent details" });
          }
     } catch (err) {
          return res.status(500).json({ message: "An unexpected error occured!", erro: err });
     }
};

exports.stopRental = async (req, res) => {
     try {
          const id = Number(req.params.id);

          // Get authorization token from authorization header
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          // Verify if it has a token
          if (!token) return res.status(401).json({ message: "Unauthorized!" });

          // decoded Token
          const decodedToken = authorize.verify(token);

          // Get username from token (to prevent client always send it)
          if (!decodedToken) {
               return res.status(401).json({ message: "Unauthorized!" });
          }

          const username = decodedToken.username;

          const rent = await getRentByUsernameAndVehicle(id, username);

          if (!rent) {
               return res.status(400).json({ message: "No rent active for vehicle and user specified!" });
          } else {
               // stop rent
               const rentToUpdate = {
                    active: "false",
               };

               const updated = await updateRent(rentToUpdate, rent.id);

               if (updated) {
                    return res.status(200).json({ message: "Rent stopped!" });
               } else {
                    return res.status(200).json({ message: "Unable to stop rent!" });
               }
          }
     } catch (err) {
          return res.status(500).json({ message: "An unexpected error occured!", erro: err });
     }
};

exports.getClosestAvailableVehicle = async (req, res) => {
     try {
          const lat = req.params.lat;
          const long = req.params.long;
          const result = [];

          if (lat && long) {
               // Get available vehicles
               const availableVehicles = await vehicleController.getAvailableVehicles();
               console.log(availableVehicles.data);

               if (availableVehicles && availableVehicles.data) {
                    // Get last Location foreach vehicle
                    const task = new Promise((resolve, reject) => {
                         availableVehicles.data.forEach(async (vehicle, index, array) => {
                              let location = await getLocationByVehicleId(vehicle.vehicleId);
                              if (location) {
                                   // add to result array
                                   result.push({
                                        vehicle,
                                        location: {
                                             lat: location.lat,
                                             long: location.long,
                                        },
                                   });
                              }

                              if (index === array.length - 1) {
                                   resolve();
                              }
                         });
                    });

                    task.then(async () => {
                         // Get closest vehicle
                         let closestVehicleId = await getClosestVehicle(result, { lat, long });
                         const vehicle = result.filter((v) => {
                              return v.vehicle.vehicleId == closestVehicleId;
                         });

                         if (vehicle) {
                              return res.status(200).json(vehicle);
                         } else {
                              return res.status(404).json({ message: "No vehicle found!" });
                         }
                    });
               } else {
                    return res.status(404).json({ message: "No vehicles available." });
               }
          } else {
               return res.status(400).json({ message: "You must provide your current geolocation coordinates." });
          }
     } catch (error) {
          return res.status(500).json(error);
     }
};

exports.getRentsByUsername = async (req, res) => {
     try {
          const username = req.params.username;

          if (!username) {
               return res.status(400).json({ message: "Must provide an username" });
          }

          const rents = await rentModel.find({ username: username });

          if (rents && rents.length > 0) {
               return res.status(200).json(rents);
          } else {
               return res.status(200).json({ message: "No rents found!" });
          }
     } catch (error) {
          return res.status(500).json({ message: "Unhandled excpetion!", error: error });
     }
};

exports.getClosestPathToVehicle = async (req, res) => {
     try {
          const vehicle = Number(req.params.id);
          const myLocation = {
               lat: Number(req.params.lat),
               long: Number(req.params.long),
          };

          if (isNaN(vehicle) || vehicle <= 0) {
               return res.status(400).json({ message: "Must provide a vehicle id!" });
          }

          if (!myLocation || isNaN(myLocation.lat) || isNaN(myLocation.long)) {
               return res.status(400).json({ message: "Must provide a valid location!" });
          }

          const lastVehicleLocation = await getLocationByVehicleId(vehicle);

          if (!lastVehicleLocation) {
               return res.status(400).json({ message: "Unable to get last vehicle location!" });
          }

          const shortestPath = await calculateClosestPath(myLocation, {
               lat: lastVehicleLocation.lat,
               long: lastVehicleLocation.long,
          });

          if (shortestPath) {
               return res.status(200).json(shortestPath);
          } else {
               return res.status(400).json({ message: "Unable to calculate shortest path!" });
          }
     } catch (error) {
          return res.status(500).json({ message: "Unexpected error!", error: error });
     }
};

getLocationByVehicleId = async (id) => {
     try {
          const location = await vehicleLocationController.getLatestLocationById(id);
          return location.data;
     } catch {
          return null;
     }
};

getClosestVehicle = async (vehicles, myLocation) => {
     let min = 0;
     let vehicleIdMin = 0;

     if (vehicles) {
          return new Promise((resolve, reject) => {
               vehicles.forEach(async (v, i, array) => {
                    let distance = await calculateDistance({ lat: v.location.lat, long: v.location.long }, { lat: myLocation.lat, long: myLocation.long });
                    if (distance && !isNaN(Number(distance))) {
                         if (i == 0) {
                              min = Number(distance);
                              vehicleIdMin = v.vehicle.vehicleId;
                         } else {
                              if (Number(distance) < min) {
                                   min = Number(distance);
                                   vehicleIdMin = v.vehicle.vehicleId;
                              }
                         }
                    }

                    if (i == array.length - 1) resolve(vehicleIdMin);
               });
          });
     }
};

calculateDistance = async (origem, destiny) => {
     try {
          const urlOrigem = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:nearest_vertex&outputformat=application/json&viewparams=x:${origem.long};y:${origem.lat};`;

          const urlDestiny = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:nearest_vertex&outputformat=application/json&viewparams=x:${Number(
               destiny.long
          )};y:${Number(destiny.lat)};`;
          const responseOrigem = await axios.get(urlOrigem);
          const responseDestiny = await axios.get(urlDestiny);

          if (responseDestiny && responseOrigem) {
               let origemPath = responseOrigem.data.features[0].properties.id;
               let destinyPath = responseDestiny.data.features[0].properties.id;

               const pathURL = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:shortest_path&outputformat=application/json&viewparams=source:${origemPath};target:${destinyPath};`;

               const result = await axios.get(pathURL);
               if (result && result.data) {
                    let distance = 0;
                    let i = 0;
                    if (result) {
                         while (i < result.data.features.length) {
                              distance += result.data.features[i].properties.distance;
                              i++;
                         }

                         return distance.toFixed(2);
                    }
               }
          }
          return null;
     } catch (error) {
          console.log(error);
          return null;
     }
};

getUserByUsername = async (token, username) => {
     try {
          if (username && token) {
               // Set auth header
               const config = {
                    headers: { Authorization: `Bearer ${token}` },
               };
               const response = await axios.get(`${authServiceURL}/getByUsername/${username}`, config);

               return response.data;
          } else {
               return null;
          }
     } catch (error) {
          return null;
     }
};

createRent = async (rent) => {
     try {
          if (!rent) return false;

          if (!rent.startLocation || !rent.startLocation.lat || !rent.startLocation.long) return false;

          if (!rent.username) return false;

          if (!rent.vehicleId) return false;

          const newRent = new rentModel();
          newRent.startDate = new Date();
          newRent.startLocation = {
               lat: rent.startLocation.lat,
               long: rent.startLocation.long,
          };
          newRent.endDate = "";
          newRent.endLocation = {
               lat: "",
               long: "",
          };
          newRent.description = "";
          newRent.username = rent.username;
          newRent.vehicleId = rent.vehicleId;
          newRent.balanceSpent = 0;
          newRent.active = true;

          const saved = await newRent.save();

          if (saved) return saved;
          else return null;
     } catch (error) {
          return null;
     }
};

getRentById = async (id) => {
     try {
          if (!id) {
               return null;
          }
          // get rent Model by Id
          const rent = await rentModel.findOne({ _id: id });
          return rent;
     } catch (error) {
          return null;
     }
};

updateRent = async (updRent, id) => {
     try {
          const dataToUpdate = {};

          if (!updRent || !id) return false;

          if (updRent.description) {
               dataToUpdate.description = updRent.description;
          }

          if (updRent.active) {
               dataToUpdate.active = updRent.active;
          }

          if (updRent.endDate && !validator.isDate(updRent.endDate)) {
               return false;
          } else {
               dataToUpdate.endDate = updRent.endDate;
          }

          if (updRent.endLocation && (!updRent.endLocation.lat || !updRent.endLocation.long)) {
               return false;
          } else if (updRent.endLocation) {
               dataToUpdate.endLocation = { lat: updRent.endLocation.lat, long: updRent.endLocation.long };
          }

          if (updRent.balance && (isNaN(Number(updRent.balance)) || Number(updRent.balance) <= 0)) {
               return false;
          } else {
               dataToUpdate.balanceSpent = updRent.balance;
          }

          const rent = await rentModel.findByIdAndUpdate(id, dataToUpdate);
          if (rent) return true;
          return false;
     } catch (error) {
          console.log(error);
          return false;
     }
};

getRentByUsernameAndVehicle = async (vehicleId, username) => {
     try {
          if (!vehicleId || !username) {
               return null;
          }
          // get rent Model by Id
          const rent = await rentModel.findOne({ username: username, vehicleId: vehicleId, active: true });
          return rent;
     } catch (error) {
          return null;
     }
};

calculateClosestPath = async (source, target) => {
     try {
          const response = {};

          const urlSource = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:nearest_vertex&outputformat=application/json&viewparams=x:${Number(
               source.long
          )};y:${Number(source.lat)};`;
          const urlTarget = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:nearest_vertex&outputformat=application/json&viewparams=x:${Number(
               target.long
          )};y:${Number(target.lat)};`;

          const responseSource = await axios.get(urlSource);
          const responseTarget = await axios.get(urlTarget);

          if (responseSource && responseTarget) {
               let sourcePath = responseSource.data.features[0].properties.id;
               let targetPath = responseTarget.data.features[0].properties.id;

               const pathURL = `${geoserverUrl}service=WFS&version=1.0.0&request=GetFeature&typeName=trabalho_AS:shortest_path&outputformat=application/json&viewparams=source:${sourcePath};target:${targetPath};`;

               const result = await axios.get(pathURL);

               if (result && result.data) {
                    return result.data;
               }
          }
          return null;
     } catch (error) {
          console.log(error);
          return null;
     }
};
