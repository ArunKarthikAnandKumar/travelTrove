const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attractionSchema = Schema({
  continentId: { type: mongoose.Schema.Types.ObjectId, ref: "Continent" },
  continent: { type: String },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  country: { type: String },
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_states" },
  state: { type: String },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_cities" },
  city: { type: String },

  name: { type: String, required: true, unique: true },
  shortDesc: { type: String, required: true },
  longDesc: { type: String },
  thumbnail: { type: String },

  highlights: [String],
  tips: [String],
  bestTimeToVisit: { type: String },
  entryFee: { type: String }, 
  openingHours: { type: String }, 
  popularFor: [String]
}, {
  collection: "tbl_attractions",
  timestamps: true
});

let attractionModel = {};

class Attraction {
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

    this.highlights = obj.highlights;
    this.tips = obj.tips;
    this.bestTimeToVisit = obj.bestTimeToVisit;
    this.entryFee = obj.entryFee;
    this.openingHours = obj.openingHours;
    this.popularFor = obj.popularFor;
  }
}

attractionModel.createAttractionModel = async () => {
  const model = mongoose.model("tbl_attractions", attractionSchema);
  return model;
};

attractionModel.createAttractionObj = (obj) => {
  return new Attraction(obj);
};

module.exports = attractionModel;
