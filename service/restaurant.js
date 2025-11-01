const restaurantModel = require("../model/Restaurant");
const continentModel = require("../model/Continent");
const countryModel = require("../model/Country");
const stateModel = require("../model/State");
const cityModel = require("../model/City");

let restaurantServices = {};

// CREATE
restaurantServices.createRestaurant = async (restaurantObj) => {
  const model = await restaurantModel.createRestaurantModel();
  const exist = await model.find({ name: restaurantObj.name });
  if (exist.length !== 0) {
    const err = new Error("Restaurant already exists");
    err.status = 400;
    throw err;
  } else {
    const data = await model.create(restaurantObj);
    return data;
  }
};

// DELETE
restaurantServices.deleteRestaurant = async (id) => {
  const model = await restaurantModel.createRestaurantModel();
  const exist = await model.findById(id);
  if (exist) {
    const data = await model.findByIdAndDelete(id);
    return data;
  } else {
    const err = new Error("Restaurant does not exist");
    err.status = 400;
    throw err;
  }
};

// UPDATE
restaurantServices.updateRestaurant = async (id, reqData) => {
  const model = await restaurantModel.createRestaurantModel();
  const exist = await model.findById(id);
  if (exist) {
    const data = await model.findByIdAndUpdate(
      id,
      { $set: reqData },
      { new: true, runValidators: true }
    );
    return data;
  } else {
    const err = new Error("Restaurant does not exist, cannot update");
    err.status = 400;
    throw err;
  }
};

// CLEAR DATABASE
restaurantServices.clearDB = async () => {
  const model = await restaurantModel.createRestaurantModel();
  const data = await model.deleteMany();
  return data;
};

// FETCH ALL RESTAURANTS + LINKED LOCATION DATA
restaurantServices.fetchAllRestaurants = async () => {
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();
  const cityModelInstance = await cityModel.createCityModel();
  const restaurantModelInstance = await restaurantModel.createRestaurantModel();

  const continentData = await contModel.aggregate([{ $project: { id: "$_id", name: 1, _id: 0 } }]);
  const countryData = await cntryModel.aggregate([{ $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } }]);
  const stateData = await stateModelInstance.aggregate([{ $project: { id: "$_id", name: 1, countryId: 1, continentId: 1, _id: 0 } }]);
  const cityData = await cityModelInstance.aggregate([{ $project: { id: "$_id", name: 1, stateId: 1, countryId: 1, continentId: 1, _id: 0 } }]);

  let restaurantData = await restaurantModelInstance.aggregate([
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
        cuisineType: 1,
        averageCost: 1,
        openingHours: 1,
        contactNumber: 1,
        facilities: 1,
        popularFor: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    }
  ]);

  // Maps to ensure location names are synced
  const continentMap = {};
  const countryMap = {};
  const stateMap = {};
  const cityMap = {};

  continentData.forEach(c => (continentMap[c.id.toString()] = c.name));
  countryData.forEach(c => (countryMap[c.id.toString()] = c.name));
  stateData.forEach(s => (stateMap[s.id.toString()] = s.name));
  cityData.forEach(ct => (cityMap[ct.id.toString()] = ct.name));

  const updates = [];

  for (const restaurant of restaurantData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinent = continentMap[restaurant.continentId?.toString()];
    if (correctContinent && restaurant.continent !== correctContinent) {
      updateFields.continent = correctContinent;
      needsUpdate = true;
    }

    const correctCountry = countryMap[restaurant.countryId?.toString()];
    if (correctCountry && restaurant.country !== correctCountry) {
      updateFields.country = correctCountry;
      needsUpdate = true;
    }

    const correctState = stateMap[restaurant.stateId?.toString()];
    if (correctState && restaurant.state !== correctState) {
      updateFields.state = correctState;
      needsUpdate = true;
    }

    const correctCity = cityMap[restaurant.cityId?.toString()];
    if (correctCity && restaurant.city !== correctCity) {
      updateFields.city = correctCity;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: restaurant.id },
          update: { $set: updateFields }
        }
      });
    }
  }

  if (updates.length > 0) {
    await restaurantModelInstance.bulkWrite(updates);
    restaurantData = await restaurantModelInstance.aggregate([
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
          cuisineType: 1,
          averageCost: 1,
          openingHours: 1,
          contactNumber: 1,
          facilities: 1,
          popularFor: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0
        }
      }
    ]);
  }

  if (restaurantData.length > 0) {
    return { restaurantData, continentData, countryData, stateData, cityData };
  } else {
    return { continentData, countryData, stateData, cityData };
  }
};

module.exports = restaurantServices;
