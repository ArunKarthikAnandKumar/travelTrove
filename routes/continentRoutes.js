const express=require('express')
const router=express.Router()
const adminServices=require('../service/admin')
const continentService=require('../service/continent')
const continentModel=require('../model/Continent')

const multer=require('multer')



const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'assets/uploads/continents')
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






router.post('/addContinent',async(req,res,next)=>{
    console.log(req.body)
       const {name,shortDesc,longDesc,thumbnail}=req.body
       // thumbnail is base64 string, store it directly in DB
       const data={name,shortDesc,longDesc,thumbnail:thumbnail||null}
       console.log(data)
       let continentObj=continentModel.createContinentObj(data)
    try{
          let data=await continentService.createContinent(continentObj)
          res.status(200).send({error:false,message:"continent added Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.delete('/deleteContinent/:id',async(req,res,next)=>{
    let id=req.params.id
    console.log(id)
    try{
          let data=await continentService.deleteContinent(id)
          res.status(200).send({error:false,message:"continent deleted Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.post('/updateContinent/:id',async(req,res,next)=>{
    let id=req.params.id
    let reqData=req.body
    console.log('32',id,reqData)
    const {name,shortDesc,longDesc,thumbnail}=req.body
    // thumbnail is base64 string, store it directly in DB
    // If thumbnail is provided, use it; otherwise keep existing
    const updatedData={name,shortDesc,longDesc}
    if(thumbnail){
        updatedData.thumbnail=thumbnail
    }
    console.log('1212',updatedData)
    try{
          let data=await continentService.updateContinent(id,updatedData)
          res.status(200).send({error:false,message:"continent Updated Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

router.get('/allContinents',async(req,res,next)=>{
    try{
          let data=await continentService.fetchAllContinents()
          res.status(200).send({error:false,message:"continent Fetched Succesfully",data:data})
        
    }catch(error){
        next(error)
    }
})

module.exports=router