const express=require('express')
const router=express.Router()

router.get('/',(req,res,next)=>{
    try{
        res.status(200).send({message:"This is authenticated Route"})

    }catch(error){
        next(error)
    }
})




module.exports=router