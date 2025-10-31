let mongoose=require('mongoose')

let connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected To MongoDb Database url: '+process.env.MONGO_URI)

    }catch(error){
        let err=new Error('Unable to connect to Database')
        err.status=400
        throw err;

    }
    

}

module.exports=connectDb