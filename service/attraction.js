const attractionModel = require('../model/Attraction');
const continentModel = require('../model/Continent');
const countryModel = require('../model/Country');
const stateModel = require('../model/State');
const cityModel = require('../model/City');

let attractionServices = {};

attractionServices.createAttraction = async (attractionObj) => {
  let model = await attractionModel.createAttractionModel();
  let exist = await model.find({ name: attractionObj.name });
  if (exist.length !== 0) {
    let err = new Error("Attraction already exists");
    err.status = 400;
    throw err;
  } else {
    let data = await model.create(attractionObj);
    return data;
  }
};

attractionServices.deleteAttraction = async (id) => {
  let model = await attractionModel.createAttractionModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndDelete(id);
    return data;
  } else {
    let err = new Error("Attraction does not exist");
    err.status = 400;
    throw err;
  }
};

attractionServices.updateAttraction = async (id, reqData) => {
  let model = await attractionModel.createAttractionModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndUpdate(
      id,
      { $set: reqData },
      { new: true, runValidators: true }
    );
    return data;
  } else {
    let err = new Error("Attraction does not exist, cannot update");
    err.status = 400;
    throw err;
  }
};

attractionServices.clearDB = async () => {
  let model = await attractionModel.createAttractionModel();
  let data = await model.deleteMany();
  return data;
};

attractionServices.fetchAllAttractions = async () => {
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();
  const cityModelInstance = await cityModel.createCityModel();
  const attractionModelInstance = await attractionModel.createAttractionModel();

  const continentData = await contModel.aggregate([
    { $project: { id: "$_id", name: 1, _id: 0 } }
  ]);

  const countryData = await cntryModel.aggregate([
    { $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } }
  ]);

  const stateData = await stateModelInstance.aggregate([
    { $project: { id: "$_id", name: 1, countryId: 1, continentId: 1, _id: 0 } }
  ]);

  const cityData = await cityModelInstance.aggregate([
    { $project: { id: "$_id", name: 1, stateId: 1, countryId: 1, continentId: 1, _id: 0 } }
  ]);

  let attractionData = await attractionModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        continentId: 1,
        continent: 1,
        countryId: 1,
        country: 1,
        stateId: 1,
        state: 1,
        cityId: 1,
        city: 1,
        shortDesc: 1,
        longDesc: 1,
        thumbnail: 1,
        highlights: 1,
        tips: 1,
        bestTimeToVisit: 1,
        entryFee: 1,
        openingHours: 1,
        popularFor: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    }
  ]);

  const continentMap = {};
  const countryMap = {};
  const stateMap = {};
  const cityMap = {};

  continentData.forEach(c => (continentMap[c.id.toString()] = c.name));
  countryData.forEach(c => (countryMap[c.id.toString()] = c.name));
  stateData.forEach(s => (stateMap[s.id.toString()] = s.name));
  cityData.forEach(ct => (cityMap[ct.id.toString()] = ct.name));

  const updates = [];

  for (const attraction of attractionData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinentName = continentMap[attraction.continentId?.toString()];
    if (correctContinentName && attraction.continent !== correctContinentName) {
      updateFields.continent = correctContinentName;
      needsUpdate = true;
    }

    const correctCountryName = countryMap[attraction.countryId?.toString()];
    if (correctCountryName && attraction.country !== correctCountryName) {
      updateFields.country = correctCountryName;
      needsUpdate = true;
    }

    const correctStateName = stateMap[attraction.stateId?.toString()];
    if (correctStateName && attraction.state !== correctStateName) {
      updateFields.state = correctStateName;
      needsUpdate = true;
    }

    const correctCityName = cityMap[attraction.cityId?.toString()];
    if (correctCityName && attraction.city !== correctCityName) {
      updateFields.city = correctCityName;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: attraction.id },
          update: { $set: updateFields }
        }
      });
    }
  }

  if (updates.length > 0) {
    await attractionModelInstance.bulkWrite(updates);
    attractionData = await attractionModelInstance.aggregate([
      {
        $project: {
          id: "$_id",
          name: 1,
          continentId: 1,
          continent: 1,
          countryId: 1,
          country: 1,
          stateId: 1,
          state: 1,
          cityId: 1,
          city: 1,
          shortDesc: 1,
          longDesc: 1,
          thumbnail: 1,
          highlights: 1,
          tips: 1,
          bestTimeToVisit: 1,
          entryFee: 1,
          openingHours: 1,
          popularFor: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0
        }
      }
    ]);
  }

  if (attractionData.length > 0) {
    return { attractionData, continentData, countryData, stateData, cityData };
  } else {
    return { continentData, countryData, stateData, cityData };
  }
};

module.exports = attractionServices;
