const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../utilites/authMiddleware");
const userModel = require("../model/users");
const DestinationGuide = require("../model/DestinationGuide");
const Itinerary = require("../model/itenary");

// Add destination guide to favorites
router.post("/addDestination", isAuthenticated, async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    const userId = req.user.id;
    
    if (!destinationId) {
      return res.status(400).json({
        error: true,
        message: 'Destination ID is required'
      });
    }
    
    const model = await userModel.createUserModel();
    const user = await model.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check if destination exists
    const destinationModel = await DestinationGuide.createDestinationGuideModel();
    const destination = await destinationModel.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({
        error: true,
        message: 'Destination guide not found'
      });
    }
    
    // Check if already in favorites
    if (user.favorites && user.favorites.destinationGuides) {
      const isAlreadyFavorite = user.favorites.destinationGuides.some(
        id => id.toString() === destinationId
      );
      
      if (isAlreadyFavorite) {
        return res.status(400).json({
          error: true,
          message: 'Destination is already in your favorites'
        });
      }
      
      user.favorites.destinationGuides.push(destinationId);
    } else {
      user.favorites = {
        destinationGuides: [destinationId],
        itineraries: user.favorites?.itineraries || []
      };
    }
    
    await user.save();
    
    res.status(200).json({
      error: false,
      message: 'Destination added to favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    console.error('Error adding destination to favorites:', error);
    next(error);
  }
});

// Remove destination guide from favorites
router.delete("/removeDestination/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id: destinationId } = req.params;
    const userId = req.user.id;
    
    const model = await userModel.createUserModel();
    const user = await model.findById(userId);
    
    if (!user || !user.favorites || !user.favorites.destinationGuides) {
      return res.status(404).json({
        error: true,
        message: 'No favorites found'
      });
    }
    
    // Remove destination
    user.favorites.destinationGuides = user.favorites.destinationGuides.filter(
      id => id.toString() !== destinationId
    );
    
    await user.save();
    
    res.status(200).json({
      error: false,
      message: 'Destination removed from favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    console.error('Error removing destination from favorites:', error);
    next(error);
  }
});

// Add itinerary to favorites
router.post("/addItinerary", isAuthenticated, async (req, res, next) => {
  try {
    const { itineraryId } = req.body;
    const userId = req.user.id;
    
    if (!itineraryId) {
      return res.status(400).json({
        error: true,
        message: 'Itinerary ID is required'
      });
    }
    
    const model = await userModel.createUserModel();
    const user = await model.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check if itinerary exists
    const itineraryModel = await Itinerary.createItineraryModel();
    const itinerary = await itineraryModel.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({
        error: true,
        message: 'Itinerary not found'
      });
    }
    
    // Check if already in favorites
    if (user.favorites && user.favorites.itineraries) {
      const isAlreadyFavorite = user.favorites.itineraries.some(
        id => id.toString() === itineraryId
      );
      
      if (isAlreadyFavorite) {
        return res.status(400).json({
          error: true,
          message: 'Itinerary is already in your favorites'
        });
      }
      
      user.favorites.itineraries.push(itineraryId);
    } else {
      user.favorites = {
        destinationGuides: user.favorites?.destinationGuides || [],
        itineraries: [itineraryId]
      };
    }
    
    await user.save();
    
    res.status(200).json({
      error: false,
      message: 'Itinerary added to favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    console.error('Error adding itinerary to favorites:', error);
    next(error);
  }
});

// Remove itinerary from favorites
router.delete("/removeItinerary/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id: itineraryId } = req.params;
    const userId = req.user.id;
    
    const model = await userModel.createUserModel();
    const user = await model.findById(userId);
    
    if (!user || !user.favorites || !user.favorites.itineraries) {
      return res.status(404).json({
        error: true,
        message: 'No favorites found'
      });
    }
    
    // Remove itinerary
    user.favorites.itineraries = user.favorites.itineraries.filter(
      id => id.toString() !== itineraryId
    );
    
    await user.save();
    
    res.status(200).json({
      error: false,
      message: 'Itinerary removed from favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    console.error('Error removing itinerary from favorites:', error);
    next(error);
  }
});

// Get all user favorites
router.get("/myFavorites", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const model = await userModel.createUserModel();
    const user = await model.findById(userId)
      .populate('favorites.destinationGuides')
      .populate('favorites.itineraries');
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      error: false,
      message: 'Favorites fetched successfully',
      data: {
        destinations: user.favorites?.destinationGuides || [],
        itineraries: user.favorites?.itineraries || []
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    next(error);
  }
});

module.exports = router;

