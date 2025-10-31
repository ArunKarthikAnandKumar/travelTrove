const continentModel=require('../model/Continent')
const Auth=require('../utilites/auth')


let continentServices={}




continentServices.createContinent=async(continentObj)=>{

    let model=await continentModel.createContinentModel()
    let continentExist=await model.find({name:continentObj.name})
    if(continentExist.length!=0){
        let err=new Error("Continent already exists")
        err.status=400
        throw err
    }else{
        let data=await model.create(continentObj)
        return data;
    }

}
continentServices.deleteContinent=async(id)=>{
    let model=await continentModel.createContinentModel()
    let continentExist=await model.findById(id)
    console.log(continentExist)
    if(continentExist){
                let data=await model.findByIdAndDelete(id)
        return data;
       
    }else{
 let err=new Error("Continent does not exists")
        err.status=400
        throw err
    }

}
continentServices.updateContinent=async(id,reqData)=>{
    let model=await continentModel.createContinentModel()
    let continentExist=await model.findById(id)
    if(continentExist){
             let data=await model.findByIdAndUpdate(id,{$set:reqData},{new:true,runValidators:true})
        return data;
       
    }else{
         let err=new Error("Continent does not exists cannot update")
        err.status=400
        throw err
   
    }

}
continentServices.clearDB=async()=>{
     let model=await continentModel.createContinentModel()
    let data=await model.deleteMany()
    return data

}
continentServices.fetchAllContinents=async()=>{
     let model=await continentModel.createContinentModel()
    let data=await model.aggregate([{$project:{id:"$_id",name:1,shortDesc:1,longDesc:1,thumbnail:1,_id:0}}])
    
    if(data.length>0){
    return data

    }else{
        let err=new Error("No continent Exist in Database")
        err.status=404
        throw err
    }
    
}




module.exports=continentServices