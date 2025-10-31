const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = Schema(
  {
    continentId: { type: mongoose.Schema.Types.ObjectId, ref: "Continent", required: true },
    continent: { type: String },

    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    country: { type: String },

    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_states", required: true },
    state: { type: String },

    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_cities", required: true },
    city: { type: String },

    name: { type: String, required: true, unique: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    thumbnail: { type: String }, // single image

    // Hotel Details
    rating: { type: Number, min: 0, max: 5 },
    priceRange: { type: String }, // e.g., "₹3000–₹7000 per night"
    roomTypes: [String], // e.g., ["Deluxe Room", "Suite", "Standard Room"]
    amenities: [String], // e.g., ["Wi-Fi", "Pool", "Gym", "Parking"]
    facilities: [String], // e.g., ["Laundry", "Restaurant", "Spa"]
    popularFor: [String], // e.g., ["Luxury Stay", "Family Vacation"]

    checkInTime: { type: String }, // e.g., "2:00 PM"
    checkOutTime: { type: String }, // e.g., "12:00 PM"
    contactNumber: { type: String },
    email: { type: String },
    website: { type: String },

    // Location Details
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      nearbyAttractions: [String], // e.g. ["Beach", "Temple"]
    },

    // Tips & Highlights
    highlights: [String],
    tips: [String],

    // Seasonal Info
    bestTimeToVisit: {
      months: [String],
      reason: { type: String },
    },
  },
  {
    collection: "tbl_hotels",
    timestamps: true,
  }
);

let hotelModel = {};

class Hotel {
  constructor(obj) {
    this.continentId = obj.continentId;
    this.continent = obj.continent;
    this.countryId = obj.countryId;
    this.country = obj.country;
    this.stateId = obj.stateId;
    this.state = obj.state;
    this.cityId = obj.cityId;
    this.city = obj.city;
    this.name = obj.name;
    this.shortDesc = obj.shortDesc;
    this.longDesc = obj.longDesc;
    this.thumbnail = obj.thumbnail;
    this.rating = obj.rating;
    this.priceRange = obj.priceRange;
    this.roomTypes = obj.roomTypes;
    this.amenities = obj.amenities;
    this.facilities = obj.facilities;
    this.popularFor = obj.popularFor;
    this.checkInTime = obj.checkInTime;
    this.checkOutTime = obj.checkOutTime;
    this.contactNumber = obj.contactNumber;
    this.email = obj.email;
    this.website = obj.website;
    this.location = obj.location;
    this.highlights = obj.highlights;
    this.tips = obj.tips;
    this.bestTimeToVisit = obj.bestTimeToVisit;
  }
}

hotelModel.createHotelModel = async () => {
  const model = mongoose.model("tbl_hotels", hotelSchema);
  return model;
};

hotelModel.createHotelObj = (obj) => {
  return new Hotel(obj);
};

module.exports = hotelModel;
