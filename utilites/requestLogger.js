const fs=require('fs')
const path=require('path')
let requestLogUrl=path.join(__dirname,'../logs/RequestLogger.txt')

let requestLoger=async (req,res,next)=>{
    console.log(requestLogUrl)
    fs.appendFileSync(requestLogUrl,`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ${req.url} ${req.method}  \n\n`)
    next()

}

module.exports=requestLoger