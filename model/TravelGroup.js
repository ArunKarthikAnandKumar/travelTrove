const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Import the User model
const User = require('./users');

const travelGroupSchema = Schema(
  {
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_itineraries" },
    itenaryName: { type: String, required: true },
    
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    
    // Group Details
    maxMembers: { type: Number, required: true },
    currentMembers: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pricePerPerson: { type: Number, required: true },
    
    // Group Status
    status: { 
      type: String, 
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming' 
    },
    
    // Privacy Settings
    isPrivate: { 
      type: Boolean, 
      default: false 
    },
    
    // Invitation system
    invitedUsers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_users' },
      invitedAt: { type: Date, default: Date.now },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_users' }
    }],
    
    // Additional Details
    meetingPoint: { type: String },
    meetingTime: { type: String },
    requirements: [String],
    inclusions: [String],
    exclusions: [String],
    
    // Admin Details
    groupAdmin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'tbl_users',
      required: true 
    },
    
    // Members
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_users' },
      joinedAt: { type: Date, default: Date.now },
      status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
        default: 'pending'
      }
    }],
    
    // Reviews and Ratings
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: "tbl_travel_groups",
    timestamps: true,
  }
);

let travelGroupModel = {};

class TravelGroup {
  constructor(obj) {
    this.itineraryId = obj.itineraryId;
    this.iternaryName = obj.iternaryName;
    this.name = obj.name;
    this.description = obj.description;
    this.thumbnail = obj.thumbnail;
    this.maxMembers = obj.maxMembers;
    this.currentMembers = obj.currentMembers || 0;
    this.startDate = obj.startDate;
    this.endDate = obj.endDate;
    this.pricePerPerson = obj.pricePerPerson;
    this.status = obj.status || 'upcoming';
    this.isPrivate = obj.isPrivate || false;
    this.invitedUsers = obj.invitedUsers || [];
    this.meetingPoint = obj.meetingPoint;
    this.meetingTime = obj.meetingTime;
    this.requirements = obj.requirements || [];
    this.inclusions = obj.inclusions || [];
    this.exclusions = obj.exclusions || [];
    this.groupAdmin = obj.groupAdmin;
    this.members = obj.members || [];
    this.averageRating = obj.averageRating || 0;
  }
}

travelGroupModel.createTravelGroupModel = async () => {
  const model = mongoose.model("tbl_travel_groups", travelGroupSchema);
  return model;
};

travelGroupModel.createTravelGroupObj = (obj) => {
  return new TravelGroup(obj);
};

// Create and export the model
const TravelGroupModel = mongoose.model('TravelGroup', travelGroupSchema);

// Helper functions
const createTravelGroupModel = () => {
  return TravelGroupModel;
};

const createTravelGroupObj = (obj) => {
  return new TravelGroup(obj);
};

// Make sure the User model is registered before exporting
// This ensures the model is available when referenced in other files
require('./users');

// Export both the travelGroupModel object and helper functions
module.exports = {
  ...travelGroupModel,
  TravelGroup,
  TravelGroupModel,
  createTravelGroupModel,
  createTravelGroupObj
};
