const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");

const itenaryService = require("../service/itenary");
const itenaryModel = require("../model/itenary");
const { isAuthenticated } = require("../utilites/authMiddleware");
const CityModel = require("../model/City");

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

// ✅ Fetch Single Itinerary by ID
router.get("/getItinerary/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const itinerary = await itenaryService.fetchItineraryById(id);
    
    res.status(200).json({
      error: false,
      message: "Itinerary fetched successfully",
      data: {
        id: itinerary._id,
        type: itinerary.type,
        title: itinerary.title,
        durationDays: itinerary.durationDays,
        thumbnail: itinerary.thumbnail,
        continentId: itinerary.continentId,
        continent: itinerary.continent,
        countryId: itinerary.countryId,
        country: itinerary.country,
        stateId: itinerary.stateId,
        state: itinerary.state,
        cityId: itinerary.cityId,
        city: itinerary.city,
        days: itinerary.days || [],
        inclusions: itinerary.inclusions || [],
        exclusions: itinerary.exclusions || [],
        priceRange: itinerary.priceRange,
        bestTimeToVisit: itinerary.bestTimeToVisit || [],
        tags: itinerary.tags || [],
        reviews: itinerary.reviews || [],
        avgRating: itinerary.avgRating || 0,
        overview: itinerary.overview || "",
      },
    });
  } catch (error) {
    if (error.status === 404) {
      res.status(404).json({
        error: true,
        message: error.message || "Itinerary not found",
      });
    } else {
      next(error);
    }
  }
});

// Create Itinerary by registered user with location validation
router.post("/user/createItinerary", isAuthenticated, upload.single("thumbnail"), async (req, res, next) => {
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

    // Validate location exists
    const cityModel = await CityModel.createCityModel();
    const cityExists = await cityModel.findById(cityId);
    
    if (!cityExists) {
      return res.status(400).json({
        error: true,
        message: 'Cannot create itinerary for location that does not exist'
      });
    }

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
      createdBy: req.user.id, // Associate with user
    };

    const data = await itenaryService.createItinerary(itenaryObj);
    res.status(200).send({
      error: false,
      message: "Itinerary created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// Add review to itinerary (Protected - Authenticated users only)
router.post("/addReview/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validate userId exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: true,
        message: 'User authentication required'
      });
    }
    
    const userId = String(req.user.id);
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: true,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const model = await itenaryModel.createItineraryModel();
    const itinerary = await model.findById(id);
    
    if (!itinerary) {
      return res.status(404).json({
        error: true,
        message: 'Itinerary not found'
      });
    }
    
    // Check if user already reviewed
    const existingReview = itinerary.reviews.find(r => {
      if (!r.userId) return false;
      // Handle both ObjectId and string userIds
      const reviewUserId = r.userId.toString ? r.userId.toString() : String(r.userId);
      return reviewUserId === userId;
    });
    if (existingReview) {
      return res.status(400).json({
        error: true,
        message: 'You have already reviewed this itinerary'
      });
    }
    
    // Add review
    itinerary.reviews.push({
      userId,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    });
    
    // Calculate new average rating
    const totalRatings = itinerary.reviews.reduce((sum, review) => sum + review.rating, 0);
    itinerary.avgRating = (totalRatings / itinerary.reviews.length).toFixed(2);
    
    await itinerary.save();
    
    res.status(200).json({
      error: false,
      message: 'Review added successfully',
      data: itinerary
    });
  } catch (error) {
    console.error('Error adding review:', error);
    next(error);
  }
});

module.exports = router;
