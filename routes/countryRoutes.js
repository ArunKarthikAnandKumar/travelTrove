const express=require('express')
const router=express.Router()
const adminServices=require('../service/admin')
const countryService=require('../service/country')
const countryModel=require('../model/Country')

const multer=require('multer')



const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'assets/uploads/country')
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






router.post('/addCountry',async(req,res,next)=>{
    console.log(req.body)
       const {name,shortDesc,longDesc,continent,continentId,thumbnail}=req.body
       // thumbnail is base64 string, store it directly in DB
       const data={name,shortDesc,longDesc,thumbnail:thumbnail||null,continent,continentId}
       console.log(data)
       let countryObj=countryModel.createCountryObj(data)
    try{
          let data=await countryService.createCountry(countryObj)
          res.status(200).send({error:false,message:"country added Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.delete('/deleteCountry/:id',async(req,res,next)=>{
    let id=req.params.id
    console.log(id)
    try{
          let data=await countryService.deleteCountry(id)
          res.status(200).send({error:false,message:"country deleted Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.post('/updateCountry/:id',async(req,res,next)=>{
    let id=req.params.id
    let reqData=req.body
    console.log('32',id,reqData)
    const {name,shortDesc,longDesc,continent,continentId,thumbnail}=req.body
    // thumbnail is base64 string, store it directly in DB
    // If thumbnail is provided, use it; otherwise keep existing
    const updatedData={name,shortDesc,longDesc,continent,continentId}
    if(thumbnail){
        updatedData.thumbnail=thumbnail
    }
    console.log('1212',updatedData)
    try{
          let data=await countryService.updateCountry(id,updatedData)
          res.status(200).send({error:false,message:"country Updated Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.get('/allCountrys',async(req,res,next)=>{
    try{
          let data=await countryService.fetchAllCountrys()
          res.status(200).send({error:false,message:"country Fetched Succesfully",data:{countryData:data.countryData,continentData:data.continentData}})
        
    }catch(error){
        next(error)
    }
})

module.exports=router