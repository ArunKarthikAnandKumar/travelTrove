const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


let auth={}

auth.encryptPassword=async (password)=>{
    const salt=await bcrypt.genSalt(10);
    const encryptedPassword=await bcrypt.hash(password,salt)
    return encryptedPassword;
}
auth.comparePassword=async(enteredPassword,hashedPassword)=>{
    let hash1=await auth.encryptPassword(enteredPassword)
    return await bcrypt.compare(enteredPassword,hashedPassword)
}


auth.genToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRY})
    
}

module.exports=auth