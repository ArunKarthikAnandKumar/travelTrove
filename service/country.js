const countryModel=require('../model/Country')
const continentModel=require('../model/Continent')
const Auth=require('../utilites/auth')


let countryServices={}




countryServices.createCountry=async(continentObj)=>{

    let model=await countryModel.createCountryModel()
    let continentExist=await model.find({name:continentObj.name})
    if(continentExist.length!=0){
        let err=new Error("Country already exists")
        err.status=400
        throw err
    }else{
        let data=await model.create(continentObj)
        return data;
    }

}
countryServices.deleteCountry=async(id)=>{
    let model=await countryModel.createCountryModel()
    let continentExist=await model.findById(id)
    console.log(continentExist)
    if(continentExist){
                let data=await model.findByIdAndDelete(id)
        return data;
       
    }else{
 let err=new Error("Country does not exists")
        err.status=400
        throw err
    }

}
countryServices.updateCountry=async(id,reqData)=>{
    let model=await countryModel.createCountryModel()
    let continentExist=await model.findById(id)
    if(continentExist){
             let data=await model.findByIdAndUpdate(id,{$set:reqData},{new:true,runValidators:true})
        return data;
       
    }else{
         let err=new Error("Country does not exists cannot update")
        err.status=400
        throw err
   
    }

}
countryServices.clearDB=async()=>{
     let model=await countryModel.createCountryModel()
    let data=await model.deleteMany()
    return data

}
//old
// countryServices.fetchAllCountrys=async()=>{
//     let contModel=await continentModel.createContinentModel()
//     let continentData=await contModel.aggregate([{$project:{id:"$_id",name:1,_id:0}}])
//      let model=await countryModel.createCountryModel()
//     let countryData=await model.aggregate([{$project:{id:"$_id",name:1,continent:1,shortDesc:1,longDesc:1,thumbnail:1,_id:0}}])
    
    
//     if(countryData.length>0){
//     return {countryData,continentData}

//     }else{
//     return {continentData}
//     }
    
// }

countryServices.fetchAllCountrys = async () => {
  const contModel = await continentModel.createContinentModel();
  const countryModelInstance = await countryModel.createCountryModel();

  const continentData = await contModel.aggregate([
    { $project: { id: "$_id", name: 1, _id: 0 } }
  ]);

  let countryData = await countryModelInstance.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        continentId: 1,
        continent: 1,
        shortDesc: 1,
        longDesc: 1,
        thumbnail: 1,
        _id: 0
      }
    }
  ]);

  const continentMap = {};
  continentData.forEach(c => (continentMap[c.id.toString()] = c.name));

  const updates = [];

  for (const country of countryData) {
    const correctContinentName = continentMap[country.continentId?.toString()];
    if (correctContinentName && country.continent !== correctContinentName) {
      updates.push({
        updateOne: {
          filter: { _id: country.id },
          update: { $set: { continent: correctContinentName } }
        }
      });
    }
  }

  if (updates.length > 0) {
    await countryModelInstance.bulkWrite(updates);
    countryData = await countryModelInstance.aggregate([
      {
        $project: {
          id: "$_id",
          name: 1,
          continentId: 1,
          continent: 1,
          shortDesc: 1,
          longDesc: 1,
          thumbnail: 1,
          _id: 0
        }
      }
    ]);
  }

  if (countryData.length > 0) {
    return { countryData, continentData };
  } else {
    return { continentData };
  }
};




module.exports=countryServices