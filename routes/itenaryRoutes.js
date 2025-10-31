const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");

const itenaryService = require("../service/itenary");
const itenaryModel = require("../model/itenary");

// Multer setup for itinerary image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/itineraries");
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

// ✅ Create Itinerary (accepts fields aligned with itinerary model)
router.post("/addItenary", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const {
      type,
      title,
      durationDays,
      continentId,
      continent,
      countryId,
      country,
      stateId,
      state,
      cityId,
      city,
      days,
      inclusions,
      exclusions,
      priceRange,
      bestTimeToVisit,
      tags,
    } = req.body;

    const itenaryObj = {
      type,
      title,
      durationDays,
      continentId,
      continent,
      countryId,
      country,
      stateId,
      state,
      cityId,
      city,
      days: parser.parseArray(days),
      inclusions: parser.parseArray(inclusions),
      exclusions: parser.parseArray(exclusions),
      priceRange,
      bestTimeToVisit: parser.parseArray(bestTimeToVisit),
      tags: parser.parseArray(tags),
      thumbnail: req.file ? `assets/uploads/itineraries/${req.file.filename}` : null,
    };

    const data = await itenaryService.createItinerary(itenaryObj);
    res.status(200).send({
      error: false,
      message: "Itinerary added successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Update Itinerary (accepts fields aligned with itinerary model)
router.post("/updateItenary/:id", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      type,
      title,
      durationDays,
      continentId,
      continent,
      countryId,
      country,
      stateId,
      state,
      cityId,
      city,
      days,
      inclusions,
      exclusions,
      priceRange,
      bestTimeToVisit,
      tags,
    } = req.body;

    const thumbnailPath = req.file
      ? `assets/uploads/itineraries/${req.file.filename}`
      : req.body.thumbnail;

    const updatedData = {
      type,
      title,
      durationDays,
      continentId,
      continent,
      countryId,
      country,
      stateId,
      state,
      cityId,
      city,
      days: parser.parseArray(days),
      inclusions: parser.parseArray(inclusions),
      exclusions: parser.parseArray(exclusions),
      priceRange,
      bestTimeToVisit: parser.parseArray(bestTimeToVisit),
      tags: parser.parseArray(tags),
      thumbnail: thumbnailPath,
    };

    const data = await itenaryService.updateItinerary(id, updatedData);
    res.status(200).send({
      error: false,
      message: "Itinerary updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Delete Itinerary
router.delete("/deleteItenary/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await itenaryService.deleteItinerary(id);
    res.status(200).send({
      error: false,
      message: "Itinerary deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Clear Database (optional utility)
router.delete("/clearDB", async (req, res, next) => {
  try {
    const data = await itenaryService.clearDB();
    res.status(200).send({
      error: false,
      message: "All itineraries cleared successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Fetch All Itineraries
router.get("/allItineraries", async (req, res, next) => {
  try {
    const data = await itenaryService.fetchAllItineraries();
    res.status(200).send({
      error: false,
      message: "Itineraries fetched successfully",
      data: {
        itineraryData: data.itineraryData,
        continentData: data.continentData,
        countryData: data.countryData,
        stateData: data.stateData,
        cityData: data.cityData,
        hotelData: data.hotelData,
        attractionData: data.attractionData,
        restaurantData: data.restaurantData,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
