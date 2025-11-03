const express=require('express')
const router=express.Router()
const adminServices=require('../service/admin')
const cityService=require('../service/city')
const cityModel=require('../model/City')
const multer=require('multer')
const parser=require('../utilites/parser')


const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'assets/uploads/city')
    },
    filename:(req,file,cb)=>{
        const uniqueName=`${Date.now()}-${file.originalname}`
        cb(null,uniqueName)
    }
})

const upload=multer({
    storage,
    limits:{fieldSize:5*1024*1024},
})

router.post("/addCity", async (req, res, next) => {
  try {
    console.log(req.body);

    const {
      name,
      shortDesc,
      longDesc,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      popularFor,
      highlights,
      history,
      tips,
      bestTimeToVisit,
      nearbyHotels,
      nearbyRestaurants,
      adventureActivities,
      thumbnail,
      shortDescImage,
      longDescImage,
      historyImage,
    } = req.body;
    
    // thumbnail is base64 string, store it directly in DB
    const cityObj ={
      name,
      shortDesc,
      longDesc,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      popularFor,
      history,
      nearbyHotels,
      nearbyRestaurants,
      thumbnail: thumbnail || null,
      shortDescImage: shortDescImage || null,
      longDescImage: longDescImage || null,
      historyImage: historyImage || null,

      highlights: parser.parseArray(highlights),
      tips: parser.parseArray(tips),
      adventureActivities: parser.parseArray(adventureActivities),
      bestTimeToVisit: parser.parseArray(bestTimeToVisit)[0],
    }
     let data=await cityService.createCity(cityObj)
        res.status(200).send({error:false,message:"City added successfully",data:data})
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.delete('/deleteCity/:id',async(req,res,next)=>{
    let id=req.params.id
    try{
        let data=await cityService.deleteCity(id)
        res.status(200).send({error:false,message:"City deleted successfully",data:data})
    }catch(error){
        next(error)
    }
})

router.post('/updateCity/:id',async(req,res,next)=>{
    let id=req.params.id
    let reqData=req.body
    console.log('City update',id,reqData)
    const {name,shortDesc,longDesc,continent,continentId,country,countryId,state,stateId,popularFor,highlights,history,tips,bestTimeToVisit,nearbyHotels,nearbyRestaurants,adventureActivities,thumbnail,shortDescImage,longDescImage,historyImage}=req.body
    // thumbnail is base64 string, store it directly in DB
    // If thumbnail is provided, use it; otherwise keep existing
    const updatedData={
        name,
        shortDesc,
        longDesc,
        continent,
        continentId,
        country,
        countryId,
        state,
        stateId,
        popularFor,
        highlights,
        history,
        tips,
        bestTimeToVisit,
        nearbyHotels,
        nearbyRestaurants,
        adventureActivities
    }
    if(thumbnail){
        updatedData.thumbnail=thumbnail
    }
    if(shortDescImage){
        updatedData.shortDescImage=shortDescImage
    }
    if(longDescImage){
        updatedData.longDescImage=longDescImage
    }
    if(historyImage){
        updatedData.historyImage=historyImage
    }
    console.log('City updatedData',updatedData)
    try{
        let data=await cityService.updateCity(id,updatedData)
        res.status(200).send({error:false,message:"City updated successfully",data:data})
    }catch(error){
        next(error)
    }
})

router.get('/allCities',async(req,res,next)=>{
    try{
        let data=await cityService.fetchAllCity()
        res.status(200).send({error:false,message:"City fetched successfully",data:{cityData:data.cityData,continentData:data.continentData,countryData:data.countryData,stateData:data.stateData}})
    }catch(error){
        next(error)
    }
})

module.exports=router