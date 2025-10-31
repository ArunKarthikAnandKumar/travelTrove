const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");
const restaurantService = require("../service/restaurant");
const restaurantModel = require("../model/Restaurant");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/restaurants");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
});

router.post("/addRestaurant", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      cuisineType,
      averageCost,
      openingHours,
      contactNumber,
      facilities,
      popularFor,
    } = req.body;

    const restaurantObj = {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      cuisineType: parser.parseArray(cuisineType),
      averageCost,
      openingHours,
      contactNumber,
      facilities: parser.parseArray(facilities),
      popularFor: parser.parseArray(popularFor),
      thumbnail: req.file ? `assets/uploads/restaurants/${req.file.filename}` : null,
    };

    const data = await restaurantService.createRestaurant(restaurantObj);
    res.status(200).send({ error: false, message: "Restaurant added successfully", data });
  } catch (error) {
    next(error);
  }
});

router.post("/updateRestaurant/:id", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      cuisineType,
      averageCost,
      openingHours,
      contactNumber,
      facilities,
      popularFor,
    } = req.body;

    const thumbnailPath = req.file
      ? `assets/uploads/restaurants/${req.file.filename}`
      : req.body.thumbnail;

    const updatedData = {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      cuisineType: parser.parseArray(cuisineType),
      averageCost,
      openingHours,
      contactNumber,
      facilities: parser.parseArray(facilities),
      popularFor: parser.parseArray(popularFor),
      thumbnail: thumbnailPath,
    };

    const data = await restaurantService.updateRestaurant(id, updatedData);
    res.status(200).send({ error: false, message: "Restaurant updated successfully", data });
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteRestaurant/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await restaurantService.deleteRestaurant(id);
    res.status(200).send({ error: false, message: "Restaurant deleted successfully", data });
  } catch (error) {
    next(error);
  }
});

router.get("/allRestaurants", async (req, res, next) => {
  try {
    const data = await restaurantService.fetchAllRestaurants();
    res.status(200).send({
      error: false,
      message: "Restaurants fetched successfully",
      data: {
        restaurantData: data.restaurantData,
        continentData: data.continentData,
        countryData: data.countryData,
        stateData: data.stateData,
        cityData: data.cityData,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
