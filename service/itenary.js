const itineraryModel = require("../model/itenary");
const continentModel = require("../model/Continent");
const countryModel = require("../model/Country");
const stateModel = require("../model/State");
const cityModel = require("../model/City");
const hotelModel = require("../model/Hotel");
const attractionModel = require("../model/Attraction");
const restaurantModel = require("../model/Restaurant");

let itineraryServices = {};

// CREATE
itineraryServices.createItinerary = async (itineraryObj) => {
  let model = await itineraryModel.createItineraryModel();
  let exist = await model.find({ title: itineraryObj.title });
  if (exist.length !== 0) {
    let err = new Error("Itinerary already exists");
    err.status = 400;
    throw err;
  } else {
    let data = await model.create(itineraryObj);
    return data;
  }
};

// DELETE
itineraryServices.deleteItinerary = async (id) => {
  let model = await itineraryModel.createItineraryModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndDelete(id);
    return data;
  } else {
    let err = new Error("Itinerary does not exist");
    err.status = 400;
    throw err;
  }
};

// UPDATE
itineraryServices.updateItinerary = async (id, reqData) => {
  let model = await itineraryModel.createItineraryModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndUpdate(
      id,
      { $set: reqData },
      { new: true, runValidators: true }
    );
    return data;
  } else {
    let err = new Error("Itinerary does not exist, cannot update");
    err.status = 400;
    throw err;
  }
};

// CLEAR DB
itineraryServices.clearDB = async () => {
  let model = await itineraryModel.createItineraryModel();
  let data = await model.deleteMany();
  return data;
};

// FETCH ALL ITINERARIES
itineraryServices.fetchAllItineraries = async () => {
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();
  const cityModelInstance = await cityModel.createCityModel();
  const hotelModelInstance = await hotelModel.createHotelModel();
  const attractionModelInstance = await attractionModel.createAttractionModel();
  const restaurantModelInstance = await restaurantModel.createRestaurantModel();
  const itineraryModelInstance = await itineraryModel.createItineraryModel();

  const continentData = await contModel.aggregate([
    { $project: { id: "$_id", name: 1, _id: 0 } },
  ]);

  const countryData = await cntryModel.aggregate([
    { $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } },
  ]);

  const stateData = await stateModelInstance.aggregate([
    { $project: { id: "$_id", name: 1, countryId: 1, continentId: 1, _id: 0 } },
  ]);

  const cityData = await cityModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        stateId: 1,
        countryId: 1,
        continentId: 1,
        _id: 0,
      },
    },
  ]);

  const hotelData = await hotelModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        cityId: 1,
        stateId: 1,
        countryId: 1,
        continentId: 1,
        _id: 0,
      },
    },
  ]);

  const attractionData = await attractionModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        cityId: 1,
        stateId: 1,
        countryId: 1,
        continentId: 1,
        _id: 0,
      },
    },
  ]);

  const restaurantData = await restaurantModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        cityId: 1,
        stateId: 1,
        countryId: 1,
        continentId: 1,
        _id: 0,
      },
    },
  ]);

  let itineraryData = await itineraryModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        type: 1,
        title: 1,
        durationDays: 1,
        thumbnail: 1,
        continentId: 1,
        continent: 1,
        countryId: 1,
        country: 1,
        stateId: 1,
        state: 1,
        cityId: 1,
        city: 1,
        days: 1,
        inclusions: 1,
        exclusions: 1,
        priceRange: 1,
        bestTimeToVisit: 1,
        tags: 1,
        avgRating: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      },
    },
  ]);

  const continentMap = {};
  const countryMap = {};
  const stateMap = {};
  const cityMap = {};
  const hotelMap = {};
  const attractionMap = {};
  const restaurantMap = {};

  continentData.forEach((c) => (continentMap[c.id.toString()] = c.name));
  countryData.forEach((c) => (countryMap[c.id.toString()] = c.name));
  stateData.forEach((s) => (stateMap[s.id.toString()] = s.name));
  cityData.forEach((ct) => (cityMap[ct.id.toString()] = ct.name));
  hotelData.forEach((h) => (hotelMap[h.id.toString()] = h.name));
  attractionData.forEach((a) => (attractionMap[a.id.toString()] = a.name));
  restaurantData.forEach((r) => (restaurantMap[r.id.toString()] = r.name));

  const updates = [];

  for (const itinerary of itineraryData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinentName = continentMap[itinerary.continentId?.toString()];
    if (correctContinentName && itinerary.continent !== correctContinentName) {
      updateFields.continent = correctContinentName;
      needsUpdate = true;
    }

    const correctCountryName = countryMap[itinerary.countryId?.toString()];
    if (correctCountryName && itinerary.country !== correctCountryName) {
      updateFields.country = correctCountryName;
      needsUpdate = true;
    }

    const correctStateName = stateMap[itinerary.stateId?.toString()];
    if (correctStateName && itinerary.state !== correctStateName) {
      updateFields.state = correctStateName;
      needsUpdate = true;
    }

    const correctCityName = cityMap[itinerary.cityId?.toString()];
    if (correctCityName && itinerary.city !== correctCityName) {
      updateFields.city = correctCityName;
      needsUpdate = true;
    }

    if (itinerary.days && Array.isArray(itinerary.days)) {
      itinerary.days.forEach((day, i) => {
        if (day.attractions && Array.isArray(day.attractions)) {
          day.attractions.forEach((a, j) => {
            const correctAttractionName = attractionMap[a.attractionId?.toString()];
            if (correctAttractionName && a.attractionName !== correctAttractionName) {
              updateFields[`days.${i}.attractions.${j}.attractionName`] =
                correctAttractionName;
              needsUpdate = true;
            }
          });
        }

        if (day.meals) {
          ["breakfast", "lunch", "dinner"].forEach((mealType) => {
            const meal = day.meals[mealType];
            if (meal?.restaurantId) {
              const correctRestaurantName =
                restaurantMap[meal.restaurantId?.toString()];
              if (
                correctRestaurantName &&
                meal.restaurantName !== correctRestaurantName
              ) {
                updateFields[`days.${i}.meals.${mealType}.restaurantName`] =
                  correctRestaurantName;
                needsUpdate = true;
              }
            }
          });
        }

        if (day.hotelStay?.hotelId) {
          const correctHotelName = hotelMap[day.hotelStay.hotelId?.toString()];
          if (correctHotelName && day.hotelStay.hotelName !== correctHotelName) {
            updateFields[`days.${i}.hotelStay.hotelName`] = correctHotelName;
            needsUpdate = true;
          }
        }
      });
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: itinerary.id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (updates.length > 0) {
    await itineraryModelInstance.bulkWrite(updates);
    itineraryData = await itineraryModelInstance.aggregate([
      {
        $project: {
          id: "$_id",
          type: 1,
          title: 1,
          durationDays: 1,
          thumbnail: 1,
          continentId: 1,
          continent: 1,
          countryId: 1,
          country: 1,
          stateId: 1,
          state: 1,
          cityId: 1,
          city: 1,
          days: 1,
          inclusions: 1,
          exclusions: 1,
          priceRange: 1,
          bestTimeToVisit: 1,
          tags: 1,
          avgRating: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0,
        },
      },
    ]);
  }

  if (itineraryData.length > 0) {
    return {
      itineraryData,
      continentData,
      countryData,
      stateData,
      cityData,
      hotelData,
      attractionData,
      restaurantData,
    };
  } else {
    return {
      continentData,
      countryData,
      stateData,
      cityData,
      hotelData,
      attractionData,
      restaurantData,
    };
  }
};

// FETCH SINGLE ITINERARY BY ID
itineraryServices.fetchItineraryById = async (id) => {
  const itineraryModelInstance = await itineraryModel.createItineraryModel();
  const itinerary = await itineraryModelInstance.findById(id).lean();
  
  if (!itinerary) {
    const err = new Error("Itinerary not found");
    err.status = 404;
    throw err;
  }
  
  return itinerary;
};

module.exports = itineraryServices;
