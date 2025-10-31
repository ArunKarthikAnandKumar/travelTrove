const hotelModel = require('../model/Hotel');
const continentModel = require('../model/Continent');
const countryModel = require('../model/Country');
const stateModel = require('../model/State');
const cityModel = require('../model/City');

let hotelServices = {};

hotelServices.createHotel = async (hotelObj) => {
  let model = await hotelModel.createHotelModel();
  let exist = await model.find({ name: hotelObj.name });
  if (exist.length !== 0) {
    let err = new Error("Hotel already exists");
    err.status = 400;
    throw err;
  } else {
    let data = await model.create(hotelObj);
    return data;
  }
};

hotelServices.deleteHotel = async (id) => {
  let model = await hotelModel.createHotelModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndDelete(id);
    return data;
  } else {
    let err = new Error("Hotel does not exist");
    err.status = 400;
    throw err;
  }
};

hotelServices.updateHotel = async (id, reqData) => {
  let model = await hotelModel.createHotelModel();
  let exist = await model.findById(id);
  if (exist) {
    let data = await model.findByIdAndUpdate(
      id,
      { $set: reqData },
      { new: true, runValidators: true }
    );
    return data;
  } else {
    let err = new Error("Hotel does not exist, cannot update");
    err.status = 400;
    throw err;
  }
};

hotelServices.clearDB = async () => {
  let model = await hotelModel.createHotelModel();
  let data = await model.deleteMany();
  return data;
};

hotelServices.fetchAllHotels = async () => {
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();
  const cityModelInstance = await cityModel.createCityModel();
  const hotelModelInstance = await hotelModel.createHotelModel();

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

  let hotelData = await hotelModelInstance.aggregate([
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
        rating: 1,
        priceRange: 1,
        roomTypes: 1,
        amenities: 1,
        facilities: 1,
        popularFor: 1,
        checkInTime: 1,
        checkOutTime: 1,
        contactNumber: 1,
        email: 1,
        website: 1,
        location: 1,
        highlights: 1,
        tips: 1,
        bestTimeToVisit: 1,
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

  for (const hotel of hotelData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinentName = continentMap[hotel.continentId?.toString()];
    if (correctContinentName && hotel.continent !== correctContinentName) {
      updateFields.continent = correctContinentName;
      needsUpdate = true;
    }

    const correctCountryName = countryMap[hotel.countryId?.toString()];
    if (correctCountryName && hotel.country !== correctCountryName) {
      updateFields.country = correctCountryName;
      needsUpdate = true;
    }

    const correctStateName = stateMap[hotel.stateId?.toString()];
    if (correctStateName && hotel.state !== correctStateName) {
      updateFields.state = correctStateName;
      needsUpdate = true;
    }

    const correctCityName = cityMap[hotel.cityId?.toString()];
    if (correctCityName && hotel.city !== correctCityName) {
      updateFields.city = correctCityName;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: hotel.id },
          update: { $set: updateFields }
        }
      });
    }
  }

  if (updates.length > 0) {
    await hotelModelInstance.bulkWrite(updates);
    hotelData = await hotelModelInstance.aggregate([
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
          rating: 1,
          priceRange: 1,
          roomTypes: 1,
          amenities: 1,
          facilities: 1,
          popularFor: 1,
          checkInTime: 1,
          checkOutTime: 1,
          contactNumber: 1,
          email: 1,
          website: 1,
          location: 1,
          highlights: 1,
          tips: 1,
          bestTimeToVisit: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0
        }
      }
    ]);
  }

  if (hotelData.length > 0) {
    return { hotelData, continentData, countryData, stateData, cityData };
  } else {
    return { continentData, countryData, stateData, cityData };
  }
};

module.exports = hotelServices;
