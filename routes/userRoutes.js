const express = require("express");
const router = express.Router();

const userServices = require("../service/users");
const adminServices = require("../service/admin");
const databaseSeeder = require("../seed/seedDatabase");
const favoritesRouter = require("./favoritesRoutes");

// ✅ Test Route
router.get("/", (req, res, next) => {
  try {
    res.status(200).send({ message: "This is a normal route" });
  } catch (error) {
    next(error);
  }
});

// ✅ Database Setup Route
router.get("/setUpDb", async (req, res, next) => {
  try {
    const data = await databaseSeeder;
    res.status(200).send({ message: "Database seeded successfully", data });
  } catch (error) {
    next(error);
  }
});

// ✅ Fetch All Users
router.get("/fetchAllUsers", async (req, res, next) => {
  try {
    const data = await userServices.fetchAllUsers();
    res.status(200).send({ error: false, message: "All user data", data });
  } catch (error) {
    next(error);
  }
});

// ✅ Register User
router.post("/register", async (req, res, next) => {
  console.log(req.body);
  try {
    const data = await userServices.registerUser(req.body);
    res.status(200).send({
      error: false,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ User Login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const data = await userServices.loginUser(email, password);
    res.status(200).send({
      error: false,
      message: "User logged in successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Make Admin
router.post("/admin/makeAdmin", async (req, res, next) => {
  const { email } = req.body;
  try {
    const data = await adminServices.makeAdmin(email);
    res.status(200).send({
      message: "Successfully made SuperAdmin",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Admin Login
router.post("/admin/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const data = await adminServices.loginAdmin(email, password);
    res.status(200).send({
      error: false,
      message: "Admin logged in successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Public search endpoint for destination guides (for visitors)
router.get("/destinationGuides/search", async (req, res, next) => {
  try {
    const { search, continent, country, state, city, limit = 10, page = 1 } = req.query;
    const DestinationGuide = require("../model/DestinationGuide");
    const model = await DestinationGuide.createDestinationGuideModel();
    
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
    const guides = await model
      .find(query)
      .select('title overview thumbnail continent country state city avgRating highlights')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ avgRating: -1, createdAt: -1 })
      .lean();
    
    // Get total count for pagination
    const total = await model.countDocuments(query);
    
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

// ✅ Get single destination guide by ID (public)
router.get("/destinationGuides/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const DestinationGuide = require("../model/DestinationGuide");
    const model = await DestinationGuide.createDestinationGuideModel();
    
    const guide = await model.findById(id).lean();
    
    if (!guide) {
      return res.status(404).json({
        error: true,
        message: 'Destination guide not found'
      });
    }
    
    // Format response
    const formattedGuide = {
      id: guide._id,
      title: guide.title,
      overview: guide.overview,
      thumbnail: guide.thumbnail,
      continent: guide.continent,
      country: guide.country,
      state: guide.state,
      city: guide.city,
      avgRating: guide.avgRating || 0,
      highlights: guide.highlights || [],
      travelTips: guide.travelTips || [],
      bestTimeToVisit: guide.bestTimeToVisit || {},
      attractions: guide.attractions || [],
      hotels: guide.hotels || [],
      restaurants: guide.restaurants || []
    };
    
    res.status(200).json({
      error: false,
      message: 'Destination guide fetched successfully',
      data: formattedGuide
    });
  } catch (error) {
    console.error('Error fetching destination guide:', error);
    res.status(500).json({
      error: true,
      message: 'An error occurred while fetching the destination guide',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ Get User Profile (Protected)
const { isAuthenticated } = require("../utilites/authMiddleware");
router.get("/user/profile", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await userServices.getUserProfile(userId);
    res.status(200).json({
      error: false,
      message: "Profile fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Update User Profile (Protected)
router.put("/user/profile", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await userServices.updateUserProfile(userId, req.body);
    res.status(200).json({
      error: false,
      message: "Profile updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Newsletter Subscription
router.post("/newsletter/subscribe", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: true,
        message: "Email is required"
      });
    }
    // For now, just return success (you can store in database later)
    res.status(200).json({
      error: false,
      message: "Successfully subscribed to newsletter",
      data: { email }
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Contact Us
router.post("/contact", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: true,
        message: "All fields are required"
      });
    }
    // For now, just return success (you can store in database or send email later)
    res.status(200).json({
      error: false,
      message: "Thank you for contacting us! We'll get back to you soon.",
      data: { name, email, subject, message }
    });
  } catch (error) {
    next(error);
  }
});

// Mount favorites routes
router.use("/favorites", favoritesRouter);

module.exports = router;
