const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");

const hotelService = require("../service/hotel");
const hotelModel = require("../model/Hotel");

// Multer setup for hotel image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/hotels");
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

router.post("/addHotel", upload.single("thumbnail"), async (req, res, next) => {
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
      rating,
      priceRange,
      roomTypes,
      amenities,
      facilities,
      popularFor,
      checkInTime,
      checkOutTime,
      contactNumber,
      email,
      website,
      highlights,
      tips,
      bestTimeToVisit,
      location,
    } = req.body;

    const hotelObj = {
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
      rating,
      priceRange,
      roomTypes: parser.parseArray(roomTypes),
      amenities: parser.parseArray(amenities),
      facilities: parser.parseArray(facilities),
      popularFor: parser.parseArray(popularFor),
      checkInTime,
      checkOutTime,
      contactNumber,
      email,
      website,
      highlights: parser.parseArray(highlights),
      tips: parser.parseArray(tips),
      bestTimeToVisit: parser.parseArray(bestTimeToVisit)[0],
      location: parser.parseObject(location),
      thumbnail: req.file ? `assets/uploads/hotels/${req.file.filename}` : null,
    };

    const data = await hotelService.createHotel(hotelObj);
    res.status(200).send({
      error: false,
      message: "Hotel added successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/updateHotel/:id", upload.single("thumbnail"), async (req, res, next) => {
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
      rating,
      priceRange,
      roomTypes,
      amenities,
      facilities,
      popularFor,
      checkInTime,
      checkOutTime,
      contactNumber,
      email,
      website,
      highlights,
      tips,
      bestTimeToVisit,
      location,
    } = req.body;

    const thumbnailPath = req.file
      ? `assets/uploads/hotels/${req.file.filename}`
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
      rating,
      priceRange,
      roomTypes: parser.parseArray(roomTypes),
      amenities: parser.parseArray(amenities),
      facilities: parser.parseArray(facilities),
      popularFor: parser.parseArray(popularFor),
      checkInTime,
      checkOutTime,
      contactNumber,
      email,
      website,
      highlights: parser.parseArray(highlights),
      tips: parser.parseArray(tips),
      bestTimeToVisit: parser.parseArray(bestTimeToVisit)[0],
      location: parser.parseObject(location),
      thumbnail: thumbnailPath,
    };

    const data = await hotelService.updateHotel(id, updatedData);
    res.status(200).send({
      error: false,
      message: "Hotel updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteHotel/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await hotelService.deleteHotel(id);
    res.status(200).send({
      error: false,
      message: "Hotel deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/allHotels", async (req, res, next) => {
  try {
    const data = await hotelService.fetchAllHotels();
    res.status(200).send({
      error: false,
      message: "Hotels fetched successfully",
      data: {
        hotelData: data.hotelData,
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
