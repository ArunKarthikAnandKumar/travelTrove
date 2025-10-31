const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");
const destinationGuideService = require("../service/destinationGuide");

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/destinationGuides");
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

// ✅ Add Destination Guide
router.post("/addDestinationGuide", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const {
      title,
      overview,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      highlights,
      travelTips,
      bestTimeToVisit,
      attractions,
      hotels,
      restaurants,
      avgRating,
      isFeatured,
      status,
      createdBy,
      updatedBy,
    } = req.body;

    const destinationObj = {
      title,
      overview,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      highlights: parser.parseArray(highlights),
      travelTips: parser.parseArray(travelTips),
      bestTimeToVisit: parser.parseObject(bestTimeToVisit), // ✅ FIXED (object not array)
      attractions: parser.parseArray(attractions),
      hotels: parser.parseArray(hotels),
      restaurants: parser.parseArray(restaurants),
      avgRating: avgRating ? Number(avgRating) : 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      status: status || "Active",
      createdBy,
      updatedBy,
      thumbnail: req.file ? `assets/uploads/destinationGuides/${req.file.filename}` : null,
    };

    const data = await destinationGuideService.createDestinationGuide(destinationObj);
    res.status(200).send({
      error: false,
      message: "Destination guide added successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Update Destination Guide
router.post("/updateDestinationGuide/:id", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title,
      overview,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      highlights,
      travelTips,
      bestTimeToVisit,
      attractions,
      hotels,
      restaurants,
      avgRating,
      isFeatured,
      status,
      updatedBy,
    } = req.body;

    const thumbnailPath = req.file
      ? `assets/uploads/destinationGuides/${req.file.filename}`
      : req.body.thumbnail;

    const updatedData = {
      title,
      overview,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      highlights: parser.parseArray(highlights),
      travelTips: parser.parseArray(travelTips),
      bestTimeToVisit: parser.parseObject(bestTimeToVisit), // ✅ FIXED
      attractions: parser.parseArray(attractions),
      hotels: parser.parseArray(hotels),
      restaurants: parser.parseArray(restaurants),
      avgRating: avgRating ? Number(avgRating) : 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      status: status || "Active",
      updatedBy,
      thumbnail: thumbnailPath,
    };

    const data = await destinationGuideService.updateDestinationGuide(id, updatedData);
    res.status(200).send({
      error: false,
      message: "Destination guide updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteDestinationGuide/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await destinationGuideService.deleteDestinationGuide(id);
    res.status(200).send({
      error: false,
      message: "Destination guide deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/allDestinationGuides", async (req, res, next) => {
  try {
    const data = await destinationGuideService.fetchAllDestinationGuides();
    res.status(200).send({
      error: false,
      message: "Destination guides fetched successfully",
      data: {
        destinationData: data.destinationData,
        continentData: data.continentData,
        countryData: data.countryData,
        stateData: data.stateData,
        cityData: data.cityData,
        attractionData: data.attractionData,
        hotelData: data.hotelData,
        restaurantData: data.restaurantData,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
