const express=require('express')
const router=express.Router()
const adminServices=require('../service/admin')
const stateService=require('../service/state')
const stateModel=require('../model/State')

const multer=require('multer')



const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'assets/uploads/state')
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






router.post('/addState',async(req,res,next)=>{
    console.log(req.body)
         const {name,shortDesc,longDesc,continent,continentId,country,countryId,popularFor,thumbnail}=req.body
       // thumbnail is base64 string, store it directly in DB
       const updatedData={name,shortDesc,longDesc,thumbnail:thumbnail||null,continent,continentId,country,countryId,popularFor}
       console.log(updatedData)
       let stateObj=stateModel.createStateObj(updatedData)
       console.log(stateObj)
    try{
          let data=await stateService.createState(stateObj)
          res.status(200).send({error:false,message:"state added Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.delete('/deleteState/:id',async(req,res,next)=>{
    let id=req.params.id
    console.log(id)
    try{
          let data=await stateService.deleteState(id)
          res.status(200).send({error:false,message:"state deleted Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.post('/updateState/:id',async(req,res,next)=>{
    let id=req.params.id
    let reqData=req.body
    console.log('32',id,reqData)
    const {name,shortDesc,longDesc,continent,continentId,country,countryId,popularFor,thumbnail}=req.body
    // thumbnail is base64 string, store it directly in DB
    // If thumbnail is provided, use it; otherwise keep existing
    const updatedData={name,shortDesc,longDesc,continent,continentId,country,countryId,popularFor}
    if(thumbnail){
        updatedData.thumbnail=thumbnail
    }
    console.log('1212',updatedData)
    try{
          let data=await stateService.updateState(id,updatedData)
          res.status(200).send({error:false,message:"state Updated Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.get('/allStates',async(req,res,next)=>{
    try{
          let data=await stateService.fetchAllStates()
          res.status(200).send({error:false,message:"state Fetched Succesfully",data:{stateData:data.stateData,continentData:data.continentData,countryData:data.countryData}})
        
    }catch(error){
        next(error)
    }
})

module.exports=router