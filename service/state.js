const stateModel=require('../model/State')
const continentModel=require('../model/Continent')
const countryModel=require('../model/Country')
const Auth=require('../utilites/auth')


let stateServices={}




stateServices.createState=async(continentObj)=>{

    let model=await stateModel.createStateModel()
    let continentExist=await model.find({name:continentObj.name})
    if(continentExist.length!=0){
        let err=new Error("State already exists")
        err.status=400
        throw err
    }else{
        let data=await model.create(continentObj)
        console.log(data)
        return null;
    }

}
stateServices.deleteState=async(id)=>{
    let model=await stateModel.createStateModel()
    let continentExist=await model.findById(id)
    console.log(continentExist)
    if(continentExist){
                let data=await model.findByIdAndDelete(id)
        return data;
       
    }else{
 let err=new Error("State does not exists")
        err.status=400
        throw err
    }

}
stateServices.updateState=async(id,reqData)=>{
    let model=await stateModel.createStateModel()
    let continentExist=await model.findById(id)
    if(continentExist){
             let data=await model.findByIdAndUpdate(id,{$set:reqData},{new:true,runValidators:true})
        return data;
       
    }else{
         let err=new Error("State does not exists cannot update")
        err.status=400
        throw err
   
    }

}
stateServices.clearDB=async()=>{
     let model=await stateModel.createStateModel()
    let data=await model.deleteMany()
    return data

}
stateServices.fetchAllStates = async () => {
  const contModel = await continentModel.createContinentModel();
  const cntryModel = await countryModel.createCountryModel();
  const stateModelInstance = await stateModel.createStateModel();

  const continentData = await contModel.aggregate([
    { $project: { id: "$_id", name: 1, _id: 0 } }
  ]);

  const countryData = await cntryModel.aggregate([
    { $project: { id: "$_id", name: 1, continentId: 1, _id: 0 } }
  ]);

  let stateData = await stateModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        continentId: 1,
        continent: 1,
        countryId: 1,
        country: 1,
        popularFor: 1,
        shortDesc: 1,
        longDesc: 1,
        thumbnail: 1,
        _id: 0
      }
    }
  ]);

  const continentMap = {};
  const countryMap = {};

  continentData.forEach(c => (continentMap[c.id.toString()] = c.name));
  countryData.forEach(c => (countryMap[c.id.toString()] = c.name));

  const updates = [];

  for (const state of stateData) {
    let needsUpdate = false;
    const updateFields = {};

    const correctContinentName = continentMap[state.continentId?.toString()];
    if (correctContinentName && state.continent !== correctContinentName) {
      updateFields.continent = correctContinentName;
      needsUpdate = true;
    }

    const correctCountryName = countryMap[state.countryId?.toString()];
    if (correctCountryName && state.country !== correctCountryName) {
      updateFields.country = correctCountryName;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: state.id },
          update: { $set: updateFields }
        }
      });
    }
  }

  if (updates.length > 0) {
    await stateModelInstance.bulkWrite(updates);
    stateData = await stateModelInstance.aggregate([
      {
        $project: {
          id: "$_id",
          name: 1,
          continentId: 1,
          continent: 1,
          countryId: 1,
          country: 1,
          popularFor: 1,
          shortDesc: 1,
          longDesc: 1,
          thumbnail: 1,
          _id: 0
        }
      }
    ]);
  }

  if (stateData.length > 0) {
    return { stateData, continentData, countryData };
  } else {
    return { continentData, countryData };
  }
};



module.exports=stateServices