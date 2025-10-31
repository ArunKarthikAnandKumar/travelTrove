const userModel=require('../model/users')
const Auth=require('../utilites/auth')

let userServices={}

userServices.registerUser=async(userData)=>{
    let userObj=userModel.createUserObj(userData)
    let model=await userModel.createUserModel()
    let userExist=await model.find({email:userObj.email})
    let hashedPassword=await Auth.encryptPassword(userData.password)
    if(userExist.length!=0){
        let err=new Error("User already exists")
        err.status=400
        throw err
    }else{
        userObj.password=hashedPassword
        userObj.isActive=1
        userObj.role="user"
        let data=await model.create(userObj)
        userObj.token=Auth.genToken(data.id)
        return userObj;
    }

}

userServices.loginUser=async(email,password)=>{
    let model=await userModel.createUserModel()
    let userData=await model.findOne({email:email})
    console.log('api hot')
    console.log('the user data in login',userData)
    if(userData){
        let passwordMatch=await Auth.comparePassword(password,userData.password)
        console.log(passwordMatch)
        if(passwordMatch){
            if(userData.isActive==1){
                let genToken=await Auth.genToken(userData.id);
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

userServices.clearDB=async()=>{
     let model=await userModel.createUserModel()
    let userData=await model.deleteMany()
    return userData

}
userServices.fetchAllUsers=async()=>{
     let model=await userModel.createUserModel()
    let userData=await model.find()
    if(userData.length>0){
    return userData

    }else{
        let err=new Error("No users Exist in Database")
        err.status=404
        throw err
    }
    
}




module.exports=userServices