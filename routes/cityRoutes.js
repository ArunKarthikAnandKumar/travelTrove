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

router.post("/addCity", upload.single("thumbnail"), async (req, res, next) => {
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
    } = req.body;
    

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
      thumbnail: req.file ? `assets/uploads/city/${req.file.filename}` : null,

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

router.post('/updateCity/:id',upload.single('thumbnail'),async(req,res,next)=>{
    let id=req.params.id
    const {name,shortDesc,longDesc,continent,continentId,country,countryId,state,stateId,popularFor,highlights,history,tips,bestTimeToVisit,nearbyHotels,nearbyRestaurants,adventureActivities}=req.body
    const thumbnailPath=req.file?`assets/uploads/city/${req.file.filename}`:`assets/uploads/city/${req.body.thumbnail}`
    const updatedData={
        name,
        shortDesc,
        longDesc,
        thumbnail:thumbnailPath,
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