const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");
const destinationGuideService = require("../service/destinationGuide");
const DestinationGuide = require("../model/DestinationGuide");
const { isAuthenticated } = require("../utilites/authMiddleware");

// Helper function to extract ObjectIds from array (handles both strings and objects)
const normalizeObjectIdArray = (value) => {
  const parsed = parser.parseArray(value);
  if (!Array.isArray(parsed)) return [];
  
  return parsed.map(item => {
    // If it's an object with 'id' property, extract the id
    if (typeof item === 'object' && item !== null && item.id) {
      return item.id;
    }
    // If it's already a string/ObjectId, return as is
    if (typeof item === 'string') {
      return item;
    }
    // If it's an ObjectId, convert to string
    if (item && item.toString) {
      return item.toString();
    }
    return item;
  }).filter(Boolean); // Remove any null/undefined/empty values
};

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
router.post("/addDestinationGuide", async (req, res, next) => {
  try {
    const {
      title,
      overview,
      history,
      culture,
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
      thumbnail,
    } = req.body;

    const destinationObj = {
      title,
      overview,
      history,
      culture,
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
      attractions: normalizeObjectIdArray(attractions),
      hotels: normalizeObjectIdArray(hotels),
      restaurants: normalizeObjectIdArray(restaurants),
      avgRating: avgRating ? Number(avgRating) : 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      status: status || "Active",
      createdBy,
      updatedBy,
      thumbnail: thumbnail || null,
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
router.post("/updateDestinationGuide/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title,
      overview,
      history,
      culture,
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
      thumbnail,
    } = req.body;

    const updatedData = {
      title,
      overview,
      history,
      culture,
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
      attractions: normalizeObjectIdArray(attractions),
      hotels: normalizeObjectIdArray(hotels),
      restaurants: normalizeObjectIdArray(restaurants),
      avgRating: avgRating ? Number(avgRating) : 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      status: status || "Active",
      updatedBy,
    };

    // Only update thumbnail if provided
    if (thumbnail) {
      updatedData.thumbnail = thumbnail;
    }

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

// Search Destination Guides with filters
router.get("/search", async (req, res, next) => {
  try {
    const { search, continent, country, state, city, limit = 10, page = 1 } = req.query;
    
    // Build the query object
    const query = { status: "Active" };
    
    // Add location filters
    if (continent) query.continent = new RegExp(continent, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (city) query.city = new RegExp(city, 'i');
    
    // Add general text search (searches across title, overview, location fields)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { overview: searchRegex },
        { continent: searchRegex },
        { country: searchRegex },
        { state: searchRegex },
        { city: searchRegex }
      ];
    }
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute the query with pagination
    const guides = await DestinationGuide
      .find(query)
      .select('title overview thumbnail continent country state city avgRating highlights')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ avgRating: -1, createdAt: -1 })
      .lean();
    
    // Get total count for pagination
    const total = await DestinationGuide.countDocuments(query);
    
    // Format the response - ensure all fields have default values
    const response = {
      success: true,
      message: total > 0 ? 'Destination guides found successfully' : 'No destinations found',
      data: guides
        .filter(guide => guide && guide._id) // Filter out any invalid guides
        .map(guide => ({
        id: guide._id.toString(),
        title: guide.title || 'Untitled Destination',
        overview: guide.overview || '',
        thumbnail: guide.thumbnail || null,
        continent: guide.continent || '',
        country: guide.country || '',
        state: guide.state || '',
        city: guide.city || '',
        avgRating: guide.avgRating || 0,
        highlights: Array.isArray(guide.highlights) ? guide.highlights : []
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching destination guides:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while searching for destination guides',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get detailed destination guide by ID (with all populated data)
router.get("/getDestinationGuide/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const DestinationGuide = require("../model/DestinationGuide");
    const Attraction = require("../model/Attraction");
    const Hotel = require("../model/Hotel");
    const Restaurant = require("../model/Restaurant");
    
    const model = await DestinationGuide.createDestinationGuideModel();
    const attractionModel = await Attraction.createAttractionModel();
    const hotelModel = await Hotel.createHotelModel();
    const restaurantModel = await Restaurant.createRestaurantModel();
    
    const guide = await model.findById(id).lean();
    
    if (!guide) {
      return res.status(404).json({
        error: true,
        message: 'Destination guide not found'
      });
    }
    
    // Check if guide is available
    if (guide.status !== 'Active') {
      return res.status(200).json({
        error: false,
        message: 'Destination guide is no longer available',
        data: {
          id: guide._id,
          title: guide.title,
          status: guide.status
        }
      });
    }
    
    // Fetch full details of linked attractions
    let attractionDetails = [];
    if (guide.attractions && guide.attractions.length > 0) {
      attractionDetails = await attractionModel
        .find({ _id: { $in: guide.attractions } })
        .select('name shortDesc longDesc thumbnail highlights tips bestTimeToVisit entryFee openingHours popularFor location rating category city state country continent')
        .lean();
    }
    
    // Fetch full details of linked hotels
    let hotelDetails = [];
    if (guide.hotels && guide.hotels.length > 0) {
      hotelDetails = await hotelModel
        .find({ _id: { $in: guide.hotels } })
        .select('name shortDesc longDesc thumbnail rating priceRange roomTypes amenities facilities popularFor checkInTime checkOutTime contactNumber email website location highlights tips bestTimeToVisit city state country continent')
        .lean();
    }
    
    // Fetch full details of linked restaurants
    let restaurantDetails = [];
    if (guide.restaurants && guide.restaurants.length > 0) {
      restaurantDetails = await restaurantModel
        .find({ _id: { $in: guide.restaurants } })
        .select('name shortDesc longDesc thumbnail cuisineType averageCost openingHours contactNumber facilities popularFor city state country continent')
        .lean();
    }
    
    // Format response
    const formattedGuide = {
      id: guide._id,
      title: guide.title,
      overview: guide.overview,
      thumbnail: guide.thumbnail,
      history: guide.history || 'No history information available',
      culture: guide.culture || 'No culture information available',
      continent: guide.continent,
      country: guide.country,
      state: guide.state,
      city: guide.city,
      highlights: guide.highlights || [],
      travelTips: guide.travelTips || [],
      bestTimeToVisit: guide.bestTimeToVisit || {},
      avgRating: guide.avgRating || 0,
      reviews: guide.reviews || [],
      attractions: attractionDetails,
      hotels: hotelDetails,
      restaurants: restaurantDetails,
      isFeatured: guide.isFeatured,
      status: guide.status,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt
    };
    
    res.status(200).json({
      error: false,
      message: 'Destination guide fetched successfully',
      data: formattedGuide
    });
  } catch (error) {
    console.error('Error fetching destination guide:', error);
    next(error);
  }
});

// Add review to destination guide (Protected - Authenticated users only)
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
    
    const model = await DestinationGuide.createDestinationGuideModel();
    const guide = await model.findById(id);
    
    if (!guide) {
      return res.status(404).json({
        error: true,
        message: 'Destination guide not found'
      });
    }
    
    // Check if user already reviewed
    const existingReview = guide.reviews.find(r => {
      if (!r.userId) return false;
      // Handle both ObjectId and string userIds
      const reviewUserId = r.userId.toString ? r.userId.toString() : String(r.userId);
      return reviewUserId === userId;
    });
    if (existingReview) {
      return res.status(400).json({
        error: true,
        message: 'You have already reviewed this destination'
      });
    }
    
    // Add review
    guide.reviews.push({
      userId,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    });
    
    // Calculate new average rating
    const totalRatings = guide.reviews.reduce((sum, review) => sum + review.rating, 0);
    guide.avgRating = (totalRatings / guide.reviews.length).toFixed(2);
    
    await guide.save();
    
    res.status(200).json({
      error: false,
      message: 'Review added successfully',
      data: guide
    });
  } catch (error) {
    console.error('Error adding review:', error);
    next(error);
  }
});

module.exports = router;
