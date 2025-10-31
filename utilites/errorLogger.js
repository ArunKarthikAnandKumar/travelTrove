const fs=require('fs')
const path=require('path')
let errorLogUrl=path.join(__dirname,'../logs/ErrorLogger.txt')

let errorLoger=async (error,req,res,next)=>{
    res.status(error.status?error.status:500)
    try{
        console.log(1)
    fs.appendFileSync(errorLogUrl,`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ${error.stack} \n\n`)
    res.send({message:error.message,error:true})
    }catch(e){
        let err=new Error("Failed in Logging Error")
        err.status=406
        throw err
    }
    next()

}

module.exports=errorLoger


