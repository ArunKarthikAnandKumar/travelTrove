const cityModel=require('../model/City')
const continentModel=require('../model/Continent')
const countryModel=require('../model/Country')
const stateModel=require('../model/State')
const Auth=require('../utilites/auth')
const parser=require('../utilites/parser')

let cityServices={}

cityServices.createCity=async(cityObj)=>{
  console.log(cityObj)
    let model=await cityModel.createCityModel()
    let cityExist=await model.find({name:cityObj.name})
    if(cityExist.length!=0){
        let err=new Error("City already exists")
        err.status=400
        throw err
    }else{
        let data=await model.create(cityObj)
        return data
    }
}

cityServices.deleteCity=async(id)=>{
    let model=await cityModel.createCityModel()
    let cityExist=await model.findById(id)
    if(cityExist){
        let data=await model.findByIdAndDelete(id)
        return data
    }else{
        let err=new Error("City does not exist")
        err.status=400
        throw err
    }
}

cityServices.updateCity=async(id,reqData)=>{
    let model=await cityModel.createCityModel()
    let cityExist=await model.findById(id)
    if(cityExist){
        let data=await model.findByIdAndUpdate(id,{$set:reqData},{new:true,runValidators:true})
        return data
    }else{
        let err=new Error("City does not exist cannot update")
        err.status=400
        throw err
    }
}

cityServices.clearDB=async()=>{
    let model=await cityModel.createCityModel()
    let data=await model.deleteMany()
    return data
}

cityServices.fetchAllCity = async () => {
  // Create model instances
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();
  const cityModelInstance = await cityModel.createCityModel();

  const continentData = await contModel.aggregate([
    { $project: { id: "$_id", name: 1, _id: 0 } }
  ]);

  const countryData = await cntryModel.aggregate([
    { $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } }
  ]);

  const stateData = await stateModelInstance.aggregate([
    { $project: { id: "$_id", name: 1, countryId: 1, continentId: 1, _id: 0 } }
  ]);

  let cityData = await cityModelInstance.aggregate([
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
        shortDesc: 1,
        longDesc: 1,
        thumbnail: 1,
        popularFor: 1,
        highlights: 1,
        history: 1,
        tips: 1,
        bestTimeToVisit: 1,
        nearbyHotels: 1,
        nearbyRestaurants: 1,
        adventureActivities: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    }
  ]);

  const continentMap = {};
  const countryMap = {};
  const stateMap = {};

  continentData.forEach(c => (continentMap[c.id.toString()] = c.name));
  countryData.forEach(c => (countryMap[c.id.toString()] = c.name));
  stateData.forEach(s => (stateMap[s.id.toString()] = s.name));

  const updates = [];

  for (const city of cityData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinentName = continentMap[city.continentId?.toString()];
    if (correctContinentName && city.continent !== correctContinentName) {
      updateFields.continent = correctContinentName;
      needsUpdate = true;
    }

    const correctCountryName = countryMap[city.countryId?.toString()];
    if (correctCountryName && city.country !== correctCountryName) {
      updateFields.country = correctCountryName;
      needsUpdate = true;
    }

    const correctStateName = stateMap[city.stateId?.toString()];
    if (correctStateName && city.state !== correctStateName) {
      updateFields.state = correctStateName;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: city.id },
          update: { $set: updateFields }
        }
      });
    }
  }

  if (updates.length > 0) {
    await cityModelInstance.bulkWrite(updates);
    cityData = await cityModelInstance.aggregate([
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
          shortDesc: 1,
          longDesc: 1,
          thumbnail: 1,
          popularFor: 1,
          highlights: 1,
          history: 1,
          tips: 1,
          bestTimeToVisit: 1,
          nearbyHotels: 1,
          nearbyRestaurants: 1,
          adventureActivities: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0
        }
      }
    ]);
  }

  if (cityData.length > 0) {
    return { cityData, continentData, countryData, stateData };
  } else {
    return { continentData, countryData, stateData };
  }
};

module.exports=cityServices