const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itinerarySchema = Schema(
  {
    type: { type: String, enum: ["Fixed", "Customizable"], required: true },
    title: { type: String, required: true },
    durationDays: { type: Number, required: true },
    thumbnail: { type: String },

    continentId: { type: mongoose.Schema.Types.ObjectId, ref: "Continent" },
    continent: { type: String },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    country: { type: String },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_states" },
    state: { type: String },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_cities" },
    city: { type: String },

    days: [
      {
        dayNumber: { type: Number },
        title: { type: String },
        description: { type: String },

        attractions: [
          {
            attractionId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_attractions" },
            attractionName: { type: String },
            startTime: { type: String },
            endTime: { type: String },
            notes: { type: String },
          },
        ],

        meals: {
          breakfast: {
            restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_restaurants" },
            restaurantName: { type: String },
            time: { type: String },
          },
          lunch: {
            restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_restaurants" },
            restaurantName: { type: String },
            time: { type: String },
          },
          dinner: {
            restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_restaurants" },
            restaurantName: { type: String },
            time: { type: String },
          },
        },

        hotelStay: {
          hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_hotels" },
          hotelName: { type: String },
          checkIn: { type: String },
          checkOut: { type: String },
        },
      },
    ],

    inclusions: [String],
    exclusions: [String],
    priceRange: { type: String },
    bestTimeToVisit: [String],
    tags: [String],

    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],

    avgRating: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_users" },
  },
  {
    collection: "tbl_itineraries",
    timestamps: true,
  }
);

// MODEL HANDLER
let itineraryModel = {};

class Itinerary {
  constructor(obj) {
    this.type = obj.type;
    this.title = obj.title;
    this.durationDays = obj.durationDays;
    this.thumbnail = obj.thumbnail;
    this.continentId = obj.continentId;
    this.continent = obj.continent;
    this.countryId = obj.countryId;
    this.country = obj.country;
    this.stateId = obj.stateId;
    this.state = obj.state;
    this.cityId = obj.cityId;
    this.city = obj.city;
    this.days = obj.days;
    this.inclusions = obj.inclusions;
    this.exclusions = obj.exclusions;
    this.priceRange = obj.priceRange;
    this.bestTimeToVisit = obj.bestTimeToVisit;
    this.tags = obj.tags;
    this.reviews = obj.reviews;
    this.avgRating = obj.avgRating;
    this.createdBy = obj.createdBy;
  }
}

itineraryModel.createItineraryModel = async () => {
  const model = mongoose.model("tbl_itineraries", itinerarySchema);
  return model;
};

itineraryModel.createItineraryObj = (obj) => {
  return new Itinerary(obj);
};

module.exports = itineraryModel;
