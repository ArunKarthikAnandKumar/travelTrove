const destinationGuideModel = require('../model/DestinationGuide');
const continentModel = require('../model/Continent');
const countryModel = require('../model/Country');
const stateModel = require('../model/State');
const cityModel = require('../model/City');
const attractionModel = require('../model/Attraction');
const hotelModel = require('../model/Hotel');
const restaurantModel = require('../model/Restaurant');

let destinationGuideServices = {};

// ✅ Create Destination Guide
destinationGuideServices.createDestinationGuide = async (destinationObj) => {
  const model = await destinationGuideModel.createDestinationGuideModel();
  const exist = await model.find({ title: destinationObj.title });
  if (exist.length !== 0) {
    const err = new Error("Destination guide already exists");
    err.status = 400;
    throw err;
  }
  return await model.create(destinationObj);
};

// ✅ Delete Destination Guide
destinationGuideServices.deleteDestinationGuide = async (id) => {
  const model = await destinationGuideModel.createDestinationGuideModel();
  const exist = await model.findById(id);
  if (!exist) {
    const err = new Error("Destination guide does not exist");
    err.status = 400;
    throw err;
  }
  return await model.findByIdAndDelete(id);
};

// ✅ Update Destination Guide
destinationGuideServices.updateDestinationGuide = async (id, reqData) => {
  const model = await destinationGuideModel.createDestinationGuideModel();
  const exist = await model.findById(id);
  if (!exist) {
    const err = new Error("Destination guide does not exist, cannot update");
    err.status = 400;
    throw err;
  }
  return await model.findByIdAndUpdate(
    id,
    { $set: reqData },
    { new: true, runValidators: true }
  );
};

// ✅ Clear all Destination Guides
destinationGuideServices.clearDB = async () => {
  const model = await destinationGuideModel.createDestinationGuideModel();
  return await model.deleteMany();
};

// ✅ Fetch All Destination Guides (with only id + name for linked data)
destinationGuideServices.fetchAllDestinationGuides = async () => {
  const [
    contModel,
    cntryModel,
    stateModelInstance,
    cityModelInstance,
    destModelInstance,
    attractionModelInstance,
    hotelModelInstance,
    restaurantModelInstance
  ] = await Promise.all([
    continentModel.createContinentModel(),
    countryModel.createCountryModel(),
    stateModel.createStateModel(),
    cityModel.createCityModel(),
    destinationGuideModel.createDestinationGuideModel(),
    attractionModel.createAttractionModel(),
    hotelModel.createHotelModel(),
    restaurantModel.createRestaurantModel()
  ]);

  const [continentData, countryData, stateData, cityData] = await Promise.all([
    contModel.aggregate([{ $project: { id: "$_id", name: 1, _id: 0 } }]),
    cntryModel.aggregate([{ $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } }]),
    stateModelInstance.aggregate([{ $project: { id: "$_id", name: 1, countryId: 1, continentId: 1, _id: 0 } }]),
    cityModelInstance.aggregate([{ $project: { id: "$_id", name: 1, stateId: 1, countryId: 1, continentId: 1, _id: 0 } }])
  ]);

  let destinationData = await destModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        title: 1,
        overview: 1,
        thumbnail: 1,
        continentId: 1,
        continent: 1,
        countryId: 1,
        country: 1,
        stateId: 1,
        state: 1,
        cityId: 1,
        city: 1,
        highlights: 1,
        travelTips: 1,
        bestTimeToVisit: 1,
        avgRating: 1,
        attractions: 1,
        hotels: 1,
        restaurants: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    }
  ]);

  // --- Fetch names for linked attraction/hotel/restaurant IDs ---
  const [attractionData, hotelData, restaurantData] = await Promise.all([
    attractionModelInstance.aggregate([{ $project: { id: "$_id", name: 1, cityId: 1, _id: 0 } }]),
    hotelModelInstance.aggregate([{ $project: { id: "$_id", name: 1, cityId: 1, _id: 0 } }]),
    restaurantModelInstance.aggregate([{ $project: { id: "$_id", name: 1, cityId: 1, _id: 0 } }])
  ]);

  // Create lookup maps for quick linking
  const attractionMap = Object.fromEntries(attractionData.map(a => [a.id.toString(), a.name]));
  const hotelMap = Object.fromEntries(hotelData.map(h => [h.id.toString(), h.name]));
  const restaurantMap = Object.fromEntries(restaurantData.map(r => [r.id.toString(), r.name]));

  // Replace ObjectIds in destinationData with { id, name }
  destinationData = destinationData.map(dest => ({
    ...dest,
    attractions: dest.attractions?.map(id => ({
      id,
      name: attractionMap[id?.toString()] || "Unknown"
    })) || [],
    hotels: dest.hotels?.map(id => ({
      id,
      name: hotelMap[id?.toString()] || "Unknown"
    })) || [],
    restaurants: dest.restaurants?.map(id => ({
      id,
      name: restaurantMap[id?.toString()] || "Unknown"
    })) || []
  }));

  return {
    destinationData,
    continentData,
    countryData,
    stateData,
    cityData,
    attractionData,
    hotelData,
    restaurantData
  };
};

module.exports = destinationGuideServices;
