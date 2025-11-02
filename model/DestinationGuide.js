const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const destinationGuideSchema = Schema({
  continentId: { type: mongoose.Schema.Types.ObjectId, ref: "Continent", required: true },
  continent: { type: String },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
  country: { type: String },
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_states", required: true },
  state: { type: String },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_cities", required: true },
  city: { type: String },

  title: { type: String, required: true },
  overview: { type: String },
  thumbnail: { type: String },

  // History and culture
  history: { type: String },
  culture: { type: String },

  // Linked sections
  attractions: [{ type: mongoose.Schema.Types.ObjectId, ref: "tbl_attractions" }],
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "tbl_hotels" }],
  restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "tbl_restaurants" }],

  highlights: [String],
  travelTips: [String],

  bestTimeToVisit: {
    months: [String],
    reason: { type: String },
  },

  // User reviews
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  avgRating: { type: Number, default: 0 },

  // Admin panel fields
  isFeatured: { type: Boolean, default: false },        // Whether to show this prominently
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // For admin approval workflow
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

}, {
  collection: "tbl_destination_guides",
  timestamps: true,
});

let destinationGuideModel = {};

class DestinationGuide {
  constructor(obj) {
    this.continentId = obj.continentId;
    this.continent = obj.continent;
    this.countryId = obj.countryId;
    this.country = obj.country;
    this.stateId = obj.stateId;
    this.state = obj.state;
    this.cityId = obj.cityId;
    this.city = obj.city;
    this.title = obj.title;
    this.overview = obj.overview;
    this.thumbnail = obj.thumbnail;
    this.history = obj.history;
    this.culture = obj.culture;
    this.attractions = obj.attractions;
    this.hotels = obj.hotels;
    this.restaurants = obj.restaurants;
    this.highlights = obj.highlights;
    this.travelTips = obj.travelTips;
    this.bestTimeToVisit = obj.bestTimeToVisit;
    this.reviews = obj.reviews;
    this.avgRating = obj.avgRating;
    this.isFeatured = obj.isFeatured;
    this.status = obj.status;
    this.createdBy = obj.createdBy;
    this.updatedBy = obj.updatedBy;
  }
}

destinationGuideModel.createDestinationGuideModel = async () => {
  const model = mongoose.model("tbl_destination_guides", destinationGuideSchema);
  return model;
};

destinationGuideModel.createDestinationGuideObj = (obj) => {
  return new DestinationGuide(obj);
};

module.exports = destinationGuideModel;
