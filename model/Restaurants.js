const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema(
  {
    // Location hierarchy
    continentId: { type: mongoose.Schema.Types.ObjectId, ref: "Continent", required: true },
    continent: { type: String },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    country: { type: String },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_states", required: true },
    state: { type: String },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_cities", required: true },
    city: { type: String },

    // Basic info
    name: { type: String, required: true, unique: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    thumbnail: { type: String }, // single image

    // Restaurant details
    cuisineType: [String], // e.g. ["South Indian", "Seafood"]
    averageCost: { type: String }, // e.g. "₹800 for two"
    openingHours: { type: String }, // e.g. "10 AM – 11 PM"
    contactNumber: { type: String },

    // Optional info
    facilities: [String], // e.g. ["Parking", "Wi-Fi"]
    popularFor: [String], // e.g. ["Family Dining", "Street Food"]
  },
  {
    collection: "tbl_restaurants",
    timestamps: true,
  }
);

module.exports = mongoose.model("tbl_restaurants", restaurantSchema);

let restaurantModel = {};

class Restaurant {
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

    this.cuisineType = obj.cuisineType;
    this.averageCost = obj.averageCost;
    this.openingHours = obj.openingHours;
    this.contactNumber = obj.contactNumber;


    this.facilities = obj.facilities;
    this.popularFor = obj.popularFor;


  }
}

restaurantModel.createRestaurantModel = async () => {
  const model = mongoose.model("tbl_restaurants", restaurantSchema);
  return model;
};

restaurantModel.createRestaurantObj = (obj) => {
  return new Restaurant(obj);
};

module.exports = restaurantModel;
