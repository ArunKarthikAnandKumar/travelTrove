const express=require('express')
const router=express.Router()
const adminServices=require('../service/admin')
const continentService=require('../service/continent')
const continentModel=require('../model/Continent')
const continentRouter=require('./continentRoutes')
const countryRouter=require('./countryRoutes')
const stateRouter=require('./stateRoutes')
const cityRouter=require('./cityRoutes')
const attractionRouter=require('./attractionRoutes')
const restaurantRouter=require('./restaurantRoutes')
const hotelRouter=require('./hotelRoutes')
const destinationGuideRouter=require('./destinationGuideRoutes')
const itenaryRouter=require('./itenaryRoutes')


router.get('/',(req,res,next)=>{
    try{
        res.status(200).send({message:"This is amin Route"})

    }catch(error){
        next(error)
    }
})
router.use('/',continentRouter)
router.use('/',countryRouter)
router.use('/',stateRouter)
router.use('/',cityRouter)
router.use('/',attractionRouter)
router.use('/',restaurantRouter)
router.use('/',hotelRouter)
router.use('/',destinationGuideRouter)
router.use('/',itenaryRouter)



module.exports=router