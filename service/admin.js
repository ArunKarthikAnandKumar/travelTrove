const userModel=require('../model/users')
const Auth=require('../utilites/auth')

let adminServices={}

adminServices.makeAdmin=async(email)=>{
    let model=await userModel.createUserModel()
    let userData=await model.findOne({email:email})
    if(userData){
        if(userData.role=="user"){
            userData.role="admin"
            return userData.save()
        }else{
            let err=new Error("The user is already a super User")
            err.status=200
            throw err
        }

    }else{
        let err=new Error("User Does not Exist ")
        err.status=404
        throw err
    }


}


adminServices.loginAdmin=async(email,password)=>{
    let model=await userModel.createUserModel()
    let userData=await model.findOne({email:email,role:"admin"})
    console.log('the user data is admin',userData)
    if(userData){
        let passwordMatch=await Auth.comparePassword(password,userData.password)
        console.log(passwordMatch)
        if(passwordMatch){
            if(userData.isActive==1){
                let genToken=Auth.genToken(userData.id);
            let userObj={
              id:userData.id,
                userName:userData.userName,
                email:userData.email,
                phoneNumber:userData.phoneNumber,
                role:userData.role,
                token:genToken,
                country:userData.country,

            }
            return userObj

            }else{
                let err=new Error("Unable to find existing user")
                err.status=404
                throw err
            }
            

        }else{
             let err=new Error("User or Password is invalid")
                err.status=400
                throw err

        }

    }else{
        let err=new Error("User Does not Exist")
        err.status=404
        throw err
    }


}

adminServices.clearDB=async()=>{
     let model=await userModel.createUserModel()
    let userData=await model.deleteMany({role:"admin"})
    return userData

}
adminServices.fetchAllAdmin=async()=>{
     let model=await userModel.createUserModel()
    let userData=await model.find({role:"admin"})
    if(userData.length>0){
    return userData

    }else{
        let err=new Error("No Admin users Exist in Database")
        err.status=404
        throw err
    }
    
}


module.exports=adminServices